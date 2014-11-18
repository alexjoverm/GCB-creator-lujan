<?php
function json_minify($json) {
	$tokenizer = "/\"|(\/\*)|(\*\/)|(\/\/)|\n|\r/";
	$in_string = false;
	$in_multiline_comment = false;
	$in_singleline_comment = false;
	$tmp; $tmp2; $new_str = array(); $ns = 0; $from = 0; $lc; $rc; $lastIndex = 0;
		
	while (preg_match($tokenizer,$json,$tmp,PREG_OFFSET_CAPTURE,$lastIndex)) {
		$tmp = $tmp[0];
		$lastIndex = $tmp[1] + strlen($tmp[0]);
		$lc = substr($json,0,$lastIndex - strlen($tmp[0]));
		$rc = substr($json,$lastIndex);
		if (!$in_multiline_comment && !$in_singleline_comment) {
			$tmp2 = substr($lc,$from);
			if (!$in_string) {
				$tmp2 = preg_replace("/(\n|\r)*/","",$tmp2);
				$tmp2 = preg_replace("/(\s)+/"," ",$tmp2);
			}
			$new_str[] = $tmp2;
		}
		$from = $lastIndex;
			
		if ($tmp[0] == "\"" && !$in_multiline_comment && !$in_singleline_comment) {
			preg_match("/(\\\\)*$/",$lc,$tmp2);
			if (!$in_string || !$tmp2 || (strlen($tmp2[0]) % 2) == 0) {	// start of string with ", or unescaped " character found to end string
				$in_string = !$in_string;
			}
			$from--; // include " character in next catch
			$rc = substr($json,$from);
		}
		else if ($tmp[0] == "/*" && !$in_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = true;
		}
		else if ($tmp[0] == "*/" && !$in_string && $in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = false;
		}
		else if ($tmp[0] == "//" && !$in_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_singleline_comment = true;
		}
		else if (($tmp[0] == "\n" || $tmp[0] == "\r") && !$in_string && !$in_multiline_comment && $in_singleline_comment) {
			$in_singleline_comment = false;
		}
		else if (!$in_multiline_comment && !$in_singleline_comment && !(preg_match("/\n|\r/",$tmp[0]))) {
			$new_str[] = $tmp[0];
		}
	}
	$new_str[] = $rc;
	return implode("",$new_str);
}



	// Cogemos el fichero
	$target_dir = '';
	$target_dir = $target_dir . basename( $_FILES['file']['name']);
	
	$fichero = basename($_FILES['file']['name']);

	if (move_uploaded_file($_FILES['file']['tmp_name'], $target_dir)) // Si se ha subido bien
	{
		// Creamos y leemos fichero
		$myfile = fopen($fichero, 'r') or die('Unable to open file!');
		$string = fread($myfile,filesize($fichero));
		
		// Buscaremos si encuentra la clausula "// <gcb-no-verify>" y guardamos la posición
		preg_match('/^\/\/( )*<gcb-no-verify>( )*$/m', $string, $matches, PREG_OFFSET_CAPTURE); 
		$pos_ini = $matches[0][1];
		$status = 'ok';
		
		if($pos_ini !== false)
		{
			// Buscaremos si encuentra la clausula "// </gcb-no-verify>" y guardamos la posición
			preg_match('/^\/\/( )*<\/gcb-no-verify>( )*$/m', $string, $matches, PREG_OFFSET_CAPTURE); 
			$pos_fin = $matches[0][1];
			$string = substr_replace($string, '', $pos_ini, ($pos_fin+strlen($matches[0][0])-$pos_ini)); // cortamos ese trozo
			$status = 'warn';
		}
		
		$response = array("status" => $status, "data" => json_minify($string)); // Seteamos la respuesta "limpia"
		fclose($myfile);
		unlink($fichero); // borramos fichero, para no acumular
		
	} else {
		$response = array("status" => "error");
	}
	
	echo json_encode($response);
	
?>

