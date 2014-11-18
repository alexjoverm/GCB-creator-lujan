'use strict';

/**
 * @ngdoc function
 * @name gcbCreatorApp.controller:AssesmentCtrl
 * @description
 * # AssesmentCtrl
 * Controller of the gcbCreatorApp
 */
angular.module('gcbCreatorApp').controller('AssesmentCtrl',['$scope', '$http','localStorageService', function ($scope,$http, localStorageService) {   
    //**************** MODELOS ***************
    
    // config lo usaremos para cosas generales
    $scope.config = {
        isActivity: false,
    }
    
    $scope.titulo = {
        text: '',
        error: false,
        success: false
    };
    
    $scope.preguntas = { 
        preamble: '',
        questionsList: [],
        checkAnswers: false
    };

    // Comprobamos si existe una sesión
    var pregArr = localStorageService.get('preguntasAss');
    var pregTit = $.trim(localStorageService.get('tituloAss'));
    
    // Si existe, preguntamos al usuario si quiere recuperarla
    if(pregArr !== null && pregArr !== undefined && (pregArr.preamble !== '' || pregArr.checkAnswers !== false || pregArr.questionsList.length > 0) || pregTit !== ''){
        bootbox.confirm('Se ha encontrado una sesión abierta, ¿Deseas recuperarla?', function(result) {
            if(result)
                $scope.$apply(function(){  // Recuperamos sesión
                    $scope.preguntas = pregArr; 
                    $scope.titulo.text = pregTit;
                });
        }); 
    }

    // Seteamos el watch para estar pendiente de cambios en Preguntas y Titulo
    $scope.$watch('preguntas', function () {
        localStorageService.add('preguntasAss', $scope.preguntas);
    }, true);
    $scope.$watch('titulo', function () {
        localStorageService.add('tituloAss', $.trim($scope.titulo.text));
    }, true);
    
            
    
//****** MARCAR
    $scope.MarcarCheckAnswers = function(){
        $scope.preguntas.checkAnswers = !$scope.preguntas.checkAnswers;
    };
    
    $scope.MarcarCorrecta = function(pI, i){
        $scope.preguntas.questionsList[pI].correct = i;
    };      
            
    
//****** ADDERS & REMOVERS
    $scope.AddChoice = function(i){
        $scope.preguntas.questionsList[i].choices.push('');
    };
    
    $scope.CloseChoice = function(pI, i){
        $scope.preguntas.questionsList[pI].choices.splice(i,1);
        
        if(i < $scope.preguntas.questionsList[pI].correct)
            $scope.preguntas.questionsList[pI].correct--;
        else if(i == $scope.preguntas.questionsList[pI].correct)
            delete $scope.preguntas.questionsList[pI].correct;
    };
    
    $scope.Close = function(i){
        $scope.preguntas.questionsList.splice(i,1);
    };
    
    $scope.CloseAll = function(){
        bootbox.confirm('<b>Se borrará todo, ¿Estás seguro?</b>', function(result) {
            if(result)
                $scope.$apply( function(){ $scope.preguntas.questionsList = []; });
        });
    };
            

//******* FACTORIES
    $scope.CrearNumerica = function(i){ 
        var obj = {
              questionHTML: '',
              correctAnswerNumeric: 0,
              lesson: '',
              colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.questionsList.push(obj) : $scope.preguntas.questionsList.splice(i,0,obj));
    };
    
    $scope.CrearFreetext = function(i){ 
        var obj = {
              questionHTML: '',
              correctAnswerString: '',
              lesson: '',
              colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.questionsList.push(obj) : $scope.preguntas.questionsList.splice(i,0,obj));
    };
    
    $scope.CrearMultiplechoice = function(i){ 
        var obj = {
              questionHTML: '',
              choices: [],
              lesson: '',
              colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.questionsList.push(obj) : $scope.preguntas.questionsList.splice(i,0,obj));
    };

    
//******** ENVIAR / RECIBIR DATOS *************
    
    $scope.ComprobarTitulo = function(){
        var patt = new RegExp(/^assessment\-[\w]+$/);
        var ret = false;                
        
        // Si todavía no se ha enviado un submit, no comprobamos
        if($scope.titulo.error == false && $scope.titulo.success == false){
            return false;
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
        
        // Quitamos colapsados, y aplicamos ParseFloat al numeric
        var jsonAux = angular.copy($scope.preguntas);
        
        for (var i in jsonAux.questionsList){
            delete jsonAux.questionsList[i].colapsado;
            
            if(jsonAux.questionsList[i].correctAnswerNumeric !== undefined){ 
                if(typeof jsonAux.questionsList[i].correctAnswerNumeric == 'string')
                    jsonAux.questionsList[i].correctAnswerNumeric = parseFloat(jsonAux.questionsList[i].correctAnswerNumeric.replace(',' , '.'));
            }
        }
        
        jsonAux.titulo = $.trim($scope.titulo.text);
        
        // Enviamos y pedimos al servidor que cree la actividad, y una vez creada la descargue
        $.post('/crear-assessment.php', {preguntas: JSON.stringify(jsonAux)} ,
          function(data,status){ 
            data = $.trim(data);
            console.log(status + '\n');
            console.log(data);
            // Si ocurriera algún error, hacer logs
            if(status != 'success')
                EnviarLogs('assessment / crear-assessment.php', 'Status: ' + status + '  --- Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            
            // Comprobamos correcto nombre de fichero
            var patt = new RegExp(/^[\w\s\.\-]+\.js$/);
            console.log(patt + '--' + data + '--' + patt.test(data) + '--' + typeof data);
            if(patt.test(data))    
                window.location='/download.php?filename=' + data;
            else{
                bootbox.alert('No es un fichero javascript, o el nombre del fichero es incorrecto. Recuerda usar nombres de ficheros sin acentos ni simbolos poco comunes');
                EnviarLogs('assessment / crear-assessment.php (invalid filename)', ' Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            }
        });
    };
    
    
    
    //************* SUBIR **************
    
    // Acciona el input[type=file] para subir el archivo
    $scope.SubirFichero = function(){ 
        $('#fichero-ass').click();
    };
    
    function EnviarLogs(from, data){
        var date = new Date();
        var date_str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        
        var json = {
            fecha: date_str,
            from: from,
            browser: BrowserInfo(),
            datos: data
        };
        
        $.post('/append-log.php', {logs: JSON.stringify(json, null, 4)});
    }
    
    // Cuando cambie el campo, subir el archivo
    $('#fichero-ass').on('change', function () { 

        // Montamos un FormData
        var file_data = $(this).prop('files')[0];   
        var form_data = new FormData();                  
        form_data.append('file', file_data);

        // realizamos petición ajax
        $.ajax({
            url: '/upload-assessment.php',
            dataType: 'text',  // que esperar en el servidor
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,                         
            type: 'post',
            success: function(data){ 
                console.log(data);
                
                data = data.replace(/var[ ]+assessment[ ]*=[ ]*/g,'');
                
                // Si hubieran errores de servidor, lo indicamos al usuario y cerramos
                try{
                   var json = JSON.parse(data);
                }
                catch(e){
                    bootbox.alert('Ha habido un error en el servidor. Por favor, informa de esto mediante un email a la dirección <a href="mailto:domoferaapp@gmail.com?Subject=Error server" target="_top">domoferaapp@gmail.com</a>');
                    console.log(e);
                    EnviarLogs('assessment / upload-assessment.php (server error)', data);
                    return;
                }

                if(json.status === 'no-is'){
                    bootbox.alert('Este fichero no es un examen!!');
                    return;
                }
                else if(json.status === 'error'){ // upload error
                    bootbox.alert('Ha ocurrido algún error subiendo el fichero. Prueba de nuevo');
                    EnviarLogs('assessment / upload-assessment.php (upload error)', data);
                    return;
                }
                
                
                
                // Convertimos a Json
                try{
                   var json_data = JSON.parse(toJSON(json.data));
                }
                catch(e){ 
                    if (e instanceof SyntaxError) {
                        bootbox.alert('Hay algún error de sintaxis en el fichero que has subido. Por favor, revisalo y vuelve a subirlo');
                        console.log(e);
                        EnviarLogs('assessment / upload-assessment.php (syntax error)', data);
                        return;
                    }
                }
                
                // Si hubieran warnings o errores, también 
                if(json.status === 'warn')
                    bootbox.alert('No se puede insertar código javascript en una actividad o examen, esos datos se han omitido');
                else if(json.status === 'regex-found'){
                    bootbox.alert('No se admite el campo correctAnswerRegex. Se ha cambiado por un correctAnswerString vacío');
                }

                // Quitar los correct(...) de las multiple choice
                for(var i in json_data.questionsList){
                    if(json_data.questionsList[i].choices != undefined){
                        for(var j in json_data.questionsList[i].choices){ 
                            var str = json_data.questionsList[i].choices[j];
                            var pos = str.indexOf('correct(');
                            if(pos == 0){ // Si encontramos un correct al principio
                                json_data.questionsList[i].choices[j] = str.substring(8,str.length-1);
                                json_data.questionsList[i].correct = parseInt(j);
                            }
                        }
                    }
                }

                // Añadimos colapsados
                for (var i in json_data.questionsList){
                    json_data.questionsList[i].colapsado = false;
                }
                
                if(json.assessmentName != undefined)
                    delete json_data.assessmentName;

                // Insertamos en el scope
                $scope.$apply(function() { $scope.preguntas = json_data; $scope.titulo.text = json.filename;});
            }
        });
    });
            
}]);
