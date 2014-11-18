/*global $:false*/
'use strict';

/**
 * @ngdoc function
 * @name gcbCreatorApp.controller:MainCtrl
 * @description
 * # Este controlador se encarga de llevar las tareas relacionadas con el $scope y AngularJS en sí
 */

angular.module('gcbCreatorApp')
.controller('MainCtrl',['$scope', '$compile', '$http','localStorageService',  function ($scope, $compile, $http, localStorageService) {
    
    
//**************** MODELOS ***************
    
    // config lo usaremos para cosas generales
    $scope.config = {
        isActivity: true,
    }
    
    // titulo
    $scope.titulo = {
        text: '',
        error: false,
        success: false
    };
    
    // preguntas
    $scope.preguntas = [];
    
    
    // Comprobamos si existe una sesión
    var pregArr = localStorageService.get('preguntasAct');
    var pregTit = $.trim(localStorageService.get('tituloAct'));
    
    // Si existe, preguntamos al usuario si quiere recuperarla
    if(pregArr !== null && pregArr !== undefined && pregArr.length > 0 || pregTit !== ''){
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
        localStorageService.add('preguntasAct', $scope.preguntas);
    }, true);
    $scope.$watch('titulo', function () {
        localStorageService.add('tituloAct', $.trim($scope.titulo.text));
    }, true);

    
    
    
    
    //***** Funciones auxiliares                    
    $scope.IsInArray = function($iGrandparent, $iParent, $i){ 
        if($.isArray($scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex))
            return $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.indexOf($i) >= 0;
        else
            return $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex == $i;
    };


  //****** CLOSES
    $scope.Close = function($pIndex, $index){
        $scope.preguntas.splice($index,1);
    };
    
    $scope.CloseAll = function(){ 
        bootbox.confirm("Se borrará todo, ¿Estás seguro?", function(result) {
            if(result)
                $scope.$apply( function(){ $scope.preguntas = []; });
        }); 
    };

    $scope.GroupClose = function($pIndex, $index){
        $scope.preguntas[$pIndex].questionsList.splice($index,1);
    };

    $scope.CloseChoice = function($pIndex, $index){
        $scope.preguntas[$pIndex].choices.splice($index,1);
    };

    $scope.InnerCloseChoice = function($iGrandparent, $iParent, $i){
        $scope.preguntas[$iGrandparent].questionsList[$iParent].choices.splice($i,1);

        // Comprobamos si $i estaba marcada, si lo estaba, quitarlo del indice
        if($.isArray($scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex))
        {
            if($scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.indexOf($i) >= 0){
                var pos = $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.indexOf($i);
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.splice(pos,1);
            }
        }
        else // Si era un numero, comprobar si era ese numero. Si es, borrarlo, sino, convertirlo a array
        {
            var n = $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex;

            if($scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex == $i)
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex = [];
            else
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex = [n];
        }
        

        // A todos los numeros mayores que el elemento borrado, restarles 1
        for (var i = 0; i < $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.length; i++) {
            if($scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex[i] > $i){
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex[i]--;
            }
        }
    };

    
//*** MARCAR CHECKBOXES
    
    // Añade/Quita del scope el indice marcado. Otra funcion de jQuery se encarga de Marcarlo/Desmarcarlo
    $scope.Marcar = function($iGrandparent, $iParent, $i){

        var correctas = $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex;

        if($scope.IsInArray($iGrandparent, $iParent, $i)){ // Si está, lo quitamos
            if($.isArray(correctas)){
                var pos = correctas.indexOf($i);
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.splice(pos,1);
            }else{
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex = [];
            }
        }
        else{ // Sino lo añadimos
            if($.isArray(correctas)){
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex.push($i);
            }else{
                $scope.preguntas[$iGrandparent].questionsList[$iParent].correctIndex = [correctas, $i];
            }
        }
    };

    $scope.MarcarSingle = function($iParent, $i){
        $scope.preguntas[$iParent].choices[$i][1] = !$scope.preguntas[$iParent].choices[$i][1];
    };

    $scope.MarcarMultiselect = function($iParent, $i){
        $scope.preguntas[$iParent].questionsList[$i].multiSelect = !$scope.preguntas[$iParent].questionsList[$i].multiSelect;
    };
    
    $scope.CheckNumber = function($i){ 
        var num = Math.floor(parseFloat($scope.preguntas[$i].allCorrectMinCount));
        $scope.preguntas[$i].allCorrectMinCount = (!isNaN(num) ? num : 1);
    };


//***** Factories

    $scope.AddChoice = function($index){ 
        var arr = ['', false, ''];
        $scope.preguntas[$index].choices.push(arr);
    };

    $scope.InnerAddChoice = function($iGrandparent, $iParent){
        var arr = [''];
        $scope.preguntas[$iGrandparent].questionsList[$iParent].choices.push(arr);
    };

    $scope.InnerAddQuestion = function($index){
        $scope.preguntas[$index].questionsList.push({ 
            questionHTML: '', choices: [], correctIndex: [], colapsado: false
        });
    };


    $scope.CrearHTML = function(i){ 
        var obj = {
            prevHTML:'',
            colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.push(obj) : $scope.preguntas.splice(i,0,obj));
        
    };

    $scope.CrearFreetext = function(i){
        var obj = {
            questionType: 'freetext',
            questionHTML: '',
            correctAnswerString: '',
            correctAnswerOutput: '',
            incorrectAnswerOutput: '',
            showAnswerOutput: '',
            colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.push(obj) : $scope.preguntas.splice(i,0,obj));
    };

    $scope.CrearMultiplechoice = function(i){
        var obj = {
            questionType:'multiple choice',
            questionHTML:'',
            choices: [
                ['', false, '']
            ],
            colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.push(obj) : $scope.preguntas.splice(i,0,obj));
    };

    $scope.CrearMultiplechoiceGroup = function(i){
        var obj = {
            questionType:'multiple choice group',
            questionGroupHTML:'',
            allCorrectMinCount: 1,
            allCorrectOutput: '',
            someIncorrectOutput: '',
            questionsList: [],
            colapsado: false
        };
        
        (i < 0 ? $scope.preguntas.push(obj) : $scope.preguntas.splice(i,0,obj));
    };

    $scope.ParsearPreguntas = function(){
        var parsedScope = [];
        $scope.preguntas.forEach(function(obj) {
            if (Object.keys(obj)[0] === 'prevHTML') parsedScope.push(obj.prevHTML);
            else parsedScope.push(JSON.stringify(obj));
        });
        return parsedScope;
    }





                            
                        
//************* ENVIAR / RECIBIR DATOS *************  
    
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
    
    // Generar y descargar el fichero
    $scope.HacerPeticion = function(){ 
        
        $scope.titulo.error = true; //Obligamos a que error sea true, así comprobara el título
        if(!$scope.ComprobarTitulo())
            return;
        
        var jsonAux = angular.copy($scope.preguntas);
        
        // Limpiamos el Json de variables adicionales
        for (var i in jsonAux){
            delete jsonAux[i].colapsado;
            
            if(jsonAux[i].questionType === 'multiple choice group')
                for(var j in jsonAux[i].questionsList)
                    delete jsonAux[i].questionsList[j].colapsado;   
        }
        
        jsonAux.push({titulo : $.trim($scope.titulo.text)}); //Añadimos titulo al final
        
        // Enviamos y pedimos al servidor que cree la actividad, y una vez creada la descargue
        $.post("/crear-activity.php", { preguntas: JSON.stringify(jsonAux) } ,
          function(data,status){ 
            
            data = $.trim(data);
            
            console.log(status + '\n');
            console.log(data);
            // Si ocurriera algún error, hacer logs
            if(status != 'success')
                EnviarLogs('activity / crear-activity.php', 'Status: ' + status + '  --- Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            
            // Comprobamos correcto nombre de fichero
            var patt = new RegExp(/^[\w\s\.\-]+\.js$/);
            if(patt.test(data))    
                window.location='/download.php?filename=' + data;
            else{
                bootbox.alert('No es un fichero javascript, o el nombre del fichero es incorrecto. Recuerda usar nombres de ficheros sin acentos ni simbolos poco comunes');
                EnviarLogs('activity / crear-activity.php (invalid filename)', ' Data: ' + data + '  \n-- JSON: ' + JSON.stringify(jsonAux));
            }
        });
    };
    
    
    //************* SUBIR **************
    
    // Acciona el input[type=file] para subir el archivo
    $scope.SubirFichero = function(){ 
        $('#fichero-act').click();
    };
    
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
    
    // Cuando cambie el campo, subir el archivo
    $('#fichero-act').on('change', function () { 

        // Montamos un FormData
        var file_data = $(this).prop('files')[0];   
        var form_data = new FormData();                  
        form_data.append('file', file_data);

        // realizamos petición ajax
        $.ajax({
            url: '/upload-activity.php',
            dataType: 'text',  // que esperar en el servidor
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,                         
            type: 'post',
            success: function(data){ 

                console.log(data);

                // Si hubieran errores de servidor, lo indicamos al usuario y cerramos
                try{
                   var json = JSON.parse(toJSON(data));
                }
                catch(e){
                    bootbox.alert('Ha habido un error en el servidor. Por favor, informa de esto mediante un email a la dirección <a href="mailto:domoferaapp@gmail.com?Subject=Error server" target="_top">domoferaapp@gmail.com</a>');
                    EnviarLogs('activity / upload-activity.php (server error)', data);
                    return;
                }

                // Si hubieran warnings o errores, también 
                if(json.status === 'no-is'){
                    bootbox.alert('Este fichero no es una actividad!!');
                    return;
                }
                else if(json.status === 'error'){
                    bootbox.alert('Ha ocurrido algún error subiendo el fichero. Prueba de nuevo');
                    EnviarLogs('activity / upload-activity.php (upload error)', data);
                    return;
                }

                var strAux = json.data.replace(/var[ ]+activity[ ]*=[ ]*/g,''); 

                // Convertimos a array
                try{
                   var arrAux = eval(strAux);
                }
                catch(e){
                    if (e instanceof SyntaxError) {
                        bootbox.alert('Hay algún error de sintaxis en el fichero que has subido. Por favor, revisalo y vuelve a subirlo');
                        EnviarLogs('activity / upload-activity.php (syntax error)', data);
                        return;
                    }
                }
                
                if(json.status === 'warn')
                    bootbox.alert('No se puede insertar código javascript en una actividad, esos datos se han omitido');

                // Los HTML sueltos, los convertimos a objeto.
                for(var i in arrAux){
                    if(!$.isPlainObject(arrAux[i]))
                        arrAux[i] = { 'prevHTML': arrAux[i] };
                }

                // Añadimos colapsados
                for (var i in arrAux){
                    arrAux[i].colapsado = false;

                    if(arrAux[i].questionType === 'multiple choice group')
                        for(var j in arrAux[i].questionsList)
                            arrAux[i].questionsList[j].colapsado = false;

                }

                // Insertamos en el scope
                $scope.$apply(function() { $scope.preguntas = arrAux;  $scope.titulo.text = json.filename;});
            }
        });
    });
    
    
                        
}]);



