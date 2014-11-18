<?php

// Añade comprobación de commillas dobles y simples
function json_minify($json) {
	$tokenizer = "/\"|'|(\/\*)|(\*\/)|(\/\/)|\n|\r/";
	$in_string = false;
	$in_int_string = false;
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
			
		if ($tmp[0] == "'" && !$in_multiline_comment && !$in_singleline_comment  && !$in_string) {
			preg_match("/(\\\\)*$/",$lc,$tmp2);
			if (!$in_int_string || !$tmp2 || (strlen($tmp2[0]) % 2) == 0) {	// start of string with ', or unescaped ' character found to end string
				$in_int_string = !$in_int_string;
			}
			$from--; // include ' character in next catch
			$rc = substr($json,$from);
		}
		else if ($tmp[0] == "\"" && !$in_multiline_comment && !$in_singleline_comment && !$in_int_string) {
			preg_match("/(\\\\)*$/",$lc,$tmp2);
			if (!$in_string || !$tmp2 || (strlen($tmp2[0]) % 2) == 0) {	// start of string with ", or unescaped " character found to end string
				$in_string = !$in_string;
			}
			$from--; // include " character in next catch
			$rc = substr($json,$from);
		}
		else if ($tmp[0] == "/*" && !$in_string && !$in_int_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = true;
		}
		else if ($tmp[0] == "*/" && !$in_string && !$in_int_string && $in_multiline_comment && !$in_singleline_comment) {
			$in_multiline_comment = false;
		}
		else if ($tmp[0] == "//" && !$in_string && !$in_int_string && !$in_multiline_comment && !$in_singleline_comment) {
			$in_singleline_comment = true;
		}
		else if (($tmp[0] == "\n" || $tmp[0] == "\r") && !$in_string && !$in_int_string && !$in_multiline_comment && $in_singleline_comment) {
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
	$target_dir = ''; // carpeta
	$target_dir = $target_dir . basename( $_FILES['file']['name']);
	
	$fichero = basename($_FILES['file']['name']);

	if (move_uploaded_file($_FILES['file']['tmp_name'], $target_dir)) // Si se ha subido bien
	{
		// Creamos y leemos fichero
		$myfile = fopen($fichero, 'r') or die('Unable to open file!');
		$string = fread($myfile,filesize($fichero));
		
		// Buscaremos si encuentra la clausula "// <gcb-no-verify>" y guardamos la posición
		preg_match('/^\/\/( )*<gcb-no-verify>( )*$/m', $string, $matches, PREG_OFFSET_CAPTURE); 
		$pos_ini = (isset($matches[0]) && isset($matches[0][1]) ? $matches[0][1] : -1);
		$status = 'ok';
		
		if($pos_ini >= 0)
		{
			// Buscaremos si encuentra la clausula "// </gcb-no-verify>" y guardamos la posición
			preg_match('/^\/\/( )*<\/gcb-no-verify>( )*$/m', $string, $matches, PREG_OFFSET_CAPTURE); 
			$pos_fin = $matches[0][1];
			$string = substr_replace($string, '', $pos_ini, ($pos_fin+strlen($matches[0][0])-$pos_ini)); // cortamos ese trozo
			$status = 'warn';
		}
		
		
		// Reemplazamos el correct('...') por "correct(...)"
		$patron = '/correct\([\'"](.*?)[\'"]\)/';
		$sust = '"correct(${1})"';
		$string = preg_replace($patron, $sust, $string);
		
		//Minificamos (hay que hacerlo antes para que funcione la siguente regexp)
		$string = json_minify($string);
			
		// Sustituimos los correctAnswerRegex por String
		$patron = '/correctAnswerRegex( )*:( )*\/[^\/]+\/[igsm]*( )*[,]?/';
		$sust = 'correctAnswerString: "",';
		if(preg_match($patron, $string)){
			$string = preg_replace($patron, $sust, $string);
			$status = "regex-found";
		}
		
		// Comprobamos que sea un fichero de assessment, mirando por la variable "var assessment"
		if(!preg_match('/var( )+assessment/', $string))
			$status = "no-is";
			
		// Quitamos extensión a nombre de fichero
		$arr_aux = explode('.', basename( $_FILES['file']['name']));
		array_pop($arr_aux);
		$file_name = implode('.', $arr_aux); 
		
		$response = array("status" => $status, "filename" => $file_name , "data" => $string); // Seteamos la respuesta "limpia"
		fclose($myfile);
		unlink($fichero); // borramos fichero, para no acumular
		
	} else {
		$response = array("status" => "error");
	}
	
	echo json_encode($response);
	
?>

