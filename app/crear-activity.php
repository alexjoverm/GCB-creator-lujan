
<?php 
    // Enumeracion
    abstract class Mode{ const Single = 0; const Multiple = 1; }

    if(isset($_POST['preguntas'])){
        $jsonAux = $_POST['preguntas'];
        $mode = Mode::Multiple;
    }else{
        $jsonAux = $_POST['pregunta'];
        $mode = Mode::Single;
    }

    $json = json_decode($jsonAux);
    $titulo = $json[count($json)-1]->titulo.'.js';

    array_pop($json);
    
    $str = 'var activity= [' . "\n";
    
    
    if($mode == Mode::Multiple){
        // Recorremos el array para quitar el prevHTML
        for($i=0 ; $i < count($json); $i++)
        {
            // JSON PRETTY PRINT requiere php >= 5.4
            if(isset($json[$i]->prevHTML))
                $str .= json_encode($json[$i]->prevHTML, JSON_PRETTY_PRINT) . ',';
            else
                $str .= json_encode($json[$i], JSON_PRETTY_PRINT) . ',';
        }
        
        $str .= "\n" . '];';
    }
    else{ 
        
        $i=0;
        $insertado = false;
        $max = count(array_keys(get_object_vars($json[0])));
        
        foreach($json[0] as $key => $value) {  
                  
            $i++;
                  
            if(!$insertado && ($key == 'customHTML2' || $key == 'iframe2')){
            	$str .= '\'<button onclick="VerSolucion()">Ver solucion</button>\',' . "\n";
                $str .= '\'<div id="panel-esconder" style="display:none;">';
            	$insertado = true;
            }      
            
			if($key == 'customHTML1')
				$str .= '\''. $value . '\'';
			else if($key == 'customHTML2')
				$str .= $value;
			else if($key == 'iframe1')
				$str .= '\''.'<iframe class="custom-iframe" src="' . $value . '"></iframe>'.'\'';
			else
				$str .= '<iframe class="custom-iframe" src="' . $value . '"></iframe>';
				
			if(($key == 'customHTML1' || $key == 'iframe1') && $i < $max)
				$str .= ",\n";
            
       }
        
        
        
        if($insertado) // Si se ha insertado el botón
        {
            $str .= '</div>\'';
            $str .= "\n" . '];' . "\n\n";
            
            $str .= '//<gcb-no-verify>' . "\n\n";
            
            $str .= 'function VerSolucion(){ var elem = document.getElementById("panel-esconder"); elem.style.display = "block"; }' . "\n\n";
            
            $str .= '//</gcb-no-verify>' . "\n\n";
        }
        else
            $str .= "\n" . '];';
        
        
    }


    
    
    $myfile = fopen($titulo, 'w') or die('Unable to open file!');
	fwrite($myfile, $str);
	fclose($myfile);
    
    echo $titulo;

?>


