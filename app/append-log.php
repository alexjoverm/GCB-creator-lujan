
<?php
    $json = $_POST['logs'];
    
    $myfile = fopen('append_log.txt', 'a') or die('Unable to open file!');
	fwrite($myfile, $json);
	fwrite($myfile, "\n\n---------------------------------------\n\n");
	fclose($myfile);
?>


