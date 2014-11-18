'use strict';

/**
 * @ngdoc function
 * @name gcbCreatorApp.controller:CustomActivityCtrl
 * @description
 * # CustomActivityCtrl
 * Controller of the gcbCreatorApp
 */
angular.module('gcbCreatorApp').controller('CustomActivityCtrl',['$scope', function ($scope) {
    
    $scope.pregunta = {
     
        customHTML1: 'a',
        iframe1: 'b',
        iframe2: 'c',
        customHTML2: 'd'
        
    };
    
    // titulo
    $scope.titulo = {
        text: '',
        error: false,
        success: false
    };
  
    
    //******** ENVIAR / RECIBIR DATOS *************
    
    function EnviarLogs(from, data){
        var date = new Date();
        var date_str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        
        var json = {
            fecha: date_str,
            from: from,
            browser: BrowserInfo(),
            datos: data
        }
        
        $.post('/append-log.php', {logs: JSON.stringify(json, null, 4)});
    }
    
    
    
    $scope.ComprobarTitulo = function(str){
        var patt = new RegExp(/^activity\-\d+\.\d+$/);
        var ret = false;                
        
        // Si todavía no se ha enviado un submit, no comprobamos
        if($scope.titulo.error == false && $scope.titulo.success == false){
            return;
        }
                        
        if(patt.test($scope.titulo.text)){
            $scope.titulo.error = false;
            $scope.titulo.success = true;
            ret = true;
        }
        else{
            $scope.titulo.error = true;
            $scope.titulo.success = false;           
        }
        
        return ret;
    };
    
    
    
    $scope.HacerPeticion = function(){ 
        
        $scope.titulo.error = true; //Obligamos a que error sea true, así comprobara el título
        if(!$scope.ComprobarTitulo())
            return;
        
        var jsonAux = angular.copy($scope.pregunta);
        
        // Comprobamos si los campos son vacios, y si son los eliminamos
        for (var key in jsonAux){
            jsonAux[key] = $.trim(jsonAux[key]);
            if(jsonAux[key] == '')
                delete jsonAux[key];
            else{
                //Comprobamos para los HTML
                var aux = $.trim(jsonAux[key].replace(/(&nbsp;)|(<[\/]?div>)|(<br[\/]?>)/gi,''));
                if(aux == '')
                    delete jsonAux[key];
            }
        }
        
        var jsonAux = [angular.copy(jsonAux)];
        jsonAux.push({titulo : $.trim($scope.titulo.text)}); //Añadimos titulo al final
        
        
        // Enviamos y pedimos al servidor que cree la actividad, y una vez creada la descargue
        $.post("/crear-activity.php", { pregunta: JSON.stringify(jsonAux, null, 4) } ,
          function(data,status)
          { 
            
            data = $.trim(data);
            
            console.log(status + '\n');
            console.log(data);
            // Si ocurriera algún error, hacer logs
            if(status != 'success')
                EnviarLogs('activity / crear-custom-activity.php', 'Status: ' + status + '  --- Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            
            // Comprobamos correcto nombre de fichero
            var patt = new RegExp(/^[\w\s\.\-]+\.js$/);
            if(patt.test(data))    
                window.location='/download.php?filename=' + data;
            else{
                bootbox.alert('No es un fichero javascript, o el nombre del fichero es incorrecto. Recuerda usar nombres de ficheros sin acentos ni simbolos poco comunes');
                EnviarLogs('activity / crear-custom-activity.php (invalid filename)', ' Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            }
        });
    };

}]);
