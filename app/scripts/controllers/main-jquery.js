/*global $:false, prompt:true*/
'use strict';

/**
 * @ngdoc function
 * @name gcbCreatorApp.controller:Main2Ctrl
 * @description
 * # Este controlador se encarga de realizar las cosas auxiliares, como jQuery, u otras funciones no propias de AngularJS
 */

function BrowserInfo(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\bOPR\/(\d+)/)
        if(tem!= null) return 'Opera '+tem[1];
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return (M.join(' ') + ' ' + navigator.platform);
}



angular.module('gcbCreatorApp').controller('Main2Ctrl',['$scope', '$compile', '$timeout', function ($scope, $compile, $timeout) {

    var isFixed = false;
    var isInnerMoving = false;
    var animColDur = 700;
    var inAnimation = false;
    var timer;
    
    $scope.maxRespuestas = 6;     // Max respuestas en preguntas
    $scope.maxPreguntasMCG = 12;  // Max preguntas en Multi-choice group
    
    
    
//**************** COLAPSAR *****************
    
    function SetColapsado(i, state){
        if($scope.config.isActivity){
            $scope.preguntas[i].colapsado = state;
        }
        else{
            $scope.preguntas.questionsList[i].colapsado = state;
        }
    }
    
    // ColapsarInner y Colapsar calculan la altura y aplican el cambio en $scope...colapsado para que surja efecto
    function ColapsarInner(objeto, h, pIndex, index){
        if(objeto.hasClass('colapsado')) // Si está colapsado, expandimos
        { 
            h = objeto.find('.questions-inside-right').outerHeight(true) + objeto.height(); 
            objeto.css('height', h);
            $scope.preguntas[pIndex].questionsList[index].colapsado = false;
            objeto.animate({ height: h-10 }, animColDur, function(){ objeto.css('height', 'auto'); });
       }
       else{ 
            objeto.animate({ height: h }, animColDur, function(){ 
                $scope.$apply( function(){ $scope.preguntas[pIndex].questionsList[index].colapsado = true; });
                objeto.css('height', 'auto'); 
            });
       }
    }
    
    function Colapsar(objeto, h, index){
        if(objeto.hasClass('colapsado')){ 
            h = objeto.find('.questions-inside-right').outerHeight(true) + objeto.height(); 
            
            objeto.css('height', h);
            objeto.animate({ height: h-10 }, animColDur, function(){ objeto.css('height', 'auto'); });
            SetColapsado(index, false);
            objeto.find('.question-collapse').children().eq(0).removeClass('fa-chevron-down').addClass('fa-chevron-up');
       }
       else{ 
            objeto.animate({ height: h }, animColDur, function(){ 
                $scope.$apply( function(){ SetColapsado(index, true); });
                objeto.css('height', 'auto'); 
            });
           
            objeto.find('.question-collapse').children().eq(0).removeClass('fa-chevron-up').addClass('fa-chevron-down');
       }
    }
    
    
    
    
//*************** MODAL EDITOR *************
    
    // Llamada que abre el modal para editar
    $scope.Editar = function($event, model, i){
        var objeto = $($event.currentTarget);
        CrearModal(objeto, model);
    };
    
    function CrearModal(target, model)
    { 
        $('.modal').remove(); //borramos los que hayan
        $('.summernote').destroy();

        // Montamos el cuerpo de antes y el de despues (header y footer)
        var string = '<div class="modal fade editor" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
            string += '<div class="modal-dialog modal-lg">';
             string += '<div class="modal-content">';
              string += '<div class="modal-header">';
               string += '<button type="button" class="btn btn-default" data-dismiss="modal"><span class="fa fa-remove" aria-hidden="true"></span><span class="sr-only">Cerrar</span></button>';
               string += '<h4 class="modal-title" id="myModalLabel">Editor </h4>';
              string += '</div>';
              string += '<div class="modal-body">';

        var stringFinal = '</div>';
            stringFinal += '<div class="modal-footer">';
             stringFinal += '<button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>';
            stringFinal += '</div></div></div></div>';


        var container = target.parent().prev();
        var modal = $(string+stringFinal);
        var isTextarea = container.is('textarea');

        var aux = '';
        var final = '';

        //Si es textarea, cargamos el text area solamente
        if(isTextarea){ 
            aux = '<textarea class="form-control" ng-model="'+ model +'"></textarea>';
        }
        else{  //Sino, cargamos el plugin de Summernote
            aux = '<div class="summernote"></div>';
        }

        // Montamos modal, compilamos y lo ejecutamos
        final = string + aux + stringFinal;
        var objFinal = $($compile(final)($scope));
        objFinal.modal();

        // Si es un contenteditable, buscamos el campo editor y lo bindeamos
        if(!isTextarea)
        {
            objFinal.find('.summernote').summernote({ 
                height: 230,
                minHeight: 200,
                maxHeight: 400,
                lang: 'es-ES',
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    //['font', ['strikethrough']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['insert', ['link', 'picture', 'video', 'table']], //'hr'
                    ['misc', ['codeview', 'undo', 'redo']],
                ],
                oninit: function() {
                    objFinal.find('.note-editable').attr('ng-bind-html', model +' | unsafe').attr('ng-model', model);
                    $compile(objFinal.find('.note-editable'))($scope);
                }
            });
        }    
    }
    

                    
//**************  ON NG-REPEAT FINISHED *******************
                    
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) { 
        
        // Reseteamos los tooltip y popover
        $('[data-toggle="popover"]').popover('destroy');  
        $('[data-toggle="tooltip"]').tooltip('destroy');
                    
        $timeout( function(){ 
            $('[data-toggle="tooltip"]').tooltip({container: 'body'}); // Seteamos el tooltip
            $('[data-toggle="popover"]').popover({
                html: true, placement: 'top', container: 'body', trigger: 'click',
                content: function () { return $compile($(this).next().html())($scope); }
            });
        }, 100);
    });
    
                    
                    

//******************* jQuery *******************

    $(document).ready(function () {

    //********** Configuraciones Iniciales ***********
                    
        // Configuramos toolbox
        bootbox.setDefaults({ locale: 'es', });
                    
        // Iniciamos Tooltips y Popovers
        $timeout( function(){ 
            $('[data-toggle="tooltip"]').tooltip({container: 'body'}); // Seteamos el tooltip
            $('[data-toggle="popover"]').popover({
                html: true, placement: 'top', container: 'body', trigger: 'click',
                content: function () { return $compile($(this).next().html())($scope); }
            });
        }, 100);    
        
        // Controlamos el Scroll para cambiar el Toolbar cuando sea necesario
        $(window).scroll(function(){
            if ($(this).scrollTop() > 105 && !isFixed) {
                $('#gcbc-toolbar').hide().fadeIn(300).addClass('fixed');
                $('#gcbc-toolbar .btn').tooltip('destroy');
                isFixed = !isFixed;
            } else if ($(this).scrollTop() <= 105 && isFixed){
                $('#gcbc-toolbar').hide().fadeIn(300).removeClass('fixed');
                $('#gcbc-toolbar .btn').tooltip({container: 'body'});
                isFixed = !isFixed;
            }
        });
                    
                    
        
    //************ SORTABLE ***********
        $scope.sortOptions = {
            placeholder: 'sortable-placeholder',
            axis: 'y',
            handle: '.questions-inside-left',
            start: function(event, ui){ $scope.onSortStart(event, ui); },
            stop: function(event, ui){ $scope.onSortStop(event, ui); }
        };
                    
        $scope.innerSortOptions = {
            placeholder: 'sortable-placeholder',
            axis: 'y',
            handle: '.inner-handle',
            start: function(event, ui){ $scope.onSortStart(event, ui); },
            stop: function(event, ui){ $scope.onSortStop(event, ui); }
        };
                    
        $scope.onSortStart = function(event, ui){ 
            ui.helper.css('opacity', 0.6);
            ui.placeholder.height(ui.helper.outerHeight());       
        };
                    
        $scope.onSortStop = function(event, ui){
            if(isInnerMoving){
                ui.item.removeClass('inner-selected');
            }else{
                ui.item.removeClass('selected');
            }
            ui.item.css('opacity', 1);   
        };

                    
        $('body').on('mousedown', function(e){ 
                    
            $('span[contenteditable]').blur();
                    
            $('[data-toggle="popover"]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0){
                    $(this).popover('hide');
                }
            });
        });
        
        
                   
                    
    //************* POPOVER **************
           
        // Controlamos la clase hovered, con cierto retardo
        $('body').on('mouseenter', '.open-popover', function(){
            var obj = $(this);
            timer = setTimeout( function(){ obj.addClass('hovered'); }, 400);   
        });
                    
        $('body').on('mouseleave', '.open-popover', function(){
            clearTimeout(timer); 
            $(this).removeClass('hovered');
        });
                
        // Cuando se abre, añadimos clase seleccionada y seteamos el tooltip;
        $('body').on('show.bs.popover', '[data-toggle="popover"]', function(){
            $(this).addClass('selected');
        });
        
        $('body').on('shown.bs.popover', '[data-toggle="popover"]', function(){
            $('[data-toggle="tooltip"]').tooltip({container: 'body', trigger: 'hover click'});
        });
        
        $('body').on('hide.bs.popover', '[data-toggle="popover"]', function(){
            $(this).removeClass('selected');
        }); 
        
        $('body').on('click', '.popover-content .btn', function(){
            $('[data-toggle="popover"]').popover('hide');
        }); 
        
        
                    
                    
        
    //*********** COLAPSADOS **************
        $scope.colapsados = false;
        
      // Colapsar TODOS
        $scope.CollapseAll = function(){  
            if(!inAnimation){ 
                // Cambios en la vista
                $('#questions-container>div>div.question-wrapper').each(function(index){ 
                    // Si están colapsados, los expandimos
                   if($scope.colapsados && $(this).hasClass('colapsado')){ 
                        var h = $(this).find('.questions-inside-right').outerHeight(true) + $(this).height(); 
                       
                       // Definimos altura de inicio, actualizamos modelo, y ponemos la altura en su valor
                        $(this).css('height', 36);
                        SetColapsado(index, false);
                        $(this).animate({ height: h-10 }, animColDur, function(){ $(this).css('height', 'auto'); });
                   }
                   else if (!$scope.colapsados && !$(this).hasClass('colapsado')){ 
                        $(this).animate({ height: 36 }, animColDur, function(){ 
                            $scope.$apply(function(){ SetColapsado(index, true); });
                            $(this).css('height', 'auto'); 
                        });
                   }
                });

                $scope.colapsados = !$scope.colapsados;
                inAnimation = true;
                setTimeout(function(){ inAnimation=false; }, animColDur);
            }
        };
        
        // A los de Grupo, hay que recalcular el del padre
        $scope.GroupCollapseAll = function($index){ 
            if(!inAnimation){ 
                var padre = $('#questions-container>div>div.question-wrapper').eq($index);
                var lista = padre.find('.question-wrapper');
                var boton = padre.find('.inner-questions-header span');

                // Colapsamos / Expandimos los bloques de preguntas
                lista.each(function(index){
                   if(boton.hasClass('fa-angle-double-down') && $(this).hasClass('colapsado')){ // Expandimos
                        var h = $(this).find('.questions-inside-right').outerHeight(true) + $(this).height();
                       
                       // Definimos altura de inicio, actualizamos modelo, y ponemos la altura en su valor
                        $(this).css('height', 45);
                         $scope.preguntas[$index].questionsList[index].colapsado = false;
                        $(this).animate({ height: h-10 }, animColDur, function(){ $(this).css('height', 'auto'); });
                   }
                   else if (boton.hasClass('fa-angle-double-up') && !$(this).hasClass('colapsado')){ // Colapsamos
                        $(this).animate({ height: 45 }, animColDur, function(){ 
                            $scope.$apply(function(){ $scope.preguntas[$index].questionsList[index].colapsado = true; });
                            $(this).css('height', 'auto'); 
                        });
                   }
                });

                // Cambiamos el botón de dirección
                boton.toggleClass('fa-angle-double-down').toggleClass('fa-angle-double-up');
            
                // Reseteamos la animación
                inAnimation = true;
                setTimeout(function(){ inAnimation=false; }, animColDur);
            }
        };
        
        
      // Colapsar UNO
        $scope.Collapse = function($index){ 
            if(!inAnimation){
                var objeto = $('#questions-container>div>div.question-wrapper').eq($index);
                Colapsar(objeto, 36, $index);                
                inAnimation = true;
                setTimeout(function(){ inAnimation=false; }, animColDur);
            }
        };
        
        // Colapsar Grupo en Multichoice Group
        $scope.GroupCollapse = function($pIndex, $index){ 
            if(!inAnimation){
                var objeto = $('#questions-container>div>div.question-wrapper').eq($pIndex).find('.question-wrapper').eq($index);
                ColapsarInner(objeto, 45, $pIndex, $index);
                
                inAnimation = true;
                setTimeout(function(){ inAnimation=false; }, animColDur);
            }
        };
        

    });
}]);

