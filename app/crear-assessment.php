
<?php
    $json = json_decode($_POST['preguntas']);
    $titulo = $json->titulo.'.js';
    
    // quitamos el titulo del array
    unset($json->titulo);
    
    $str = 'var assessment= ';
    
    // Recorremos el array para quitar el prevHTML
    for($i=0 ; $i < count($json->questionsList); $i++)
    {
    	if(isset($json->questionsList[$i]->choices) && count($json->questionsList[$i]->choices) > 0){
    		$j = (isset($json->questionsList[$i]->correct) ? $json->questionsList[$i]->correct : 0);
    		$json->questionsList[$i]->choices[$j] = 'correct(' . $json->questionsList[$i]->choices[$j] . ')';
    		unset($json->questionsList[$i]->correct);
    	}
    }
    
    $str .= json_encode($json, JSON_PRETTY_PRINT);
    
    //Reemplazar "correct(...)" por correct('...');
	$patron = '/"correct\((.+)\)"/i';
	$sust = 'correct(\'${1}\')';
	$str = preg_replace($patron, $sust, $str);
    
    
    $myfile = fopen($titulo, 'w') or die('Unable to open file!');
	fwrite($myfile, $str);
	fclose($myfile);
    
    echo $titulo;

?>


