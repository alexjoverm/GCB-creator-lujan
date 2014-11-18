// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// sample activities

var activity = [

  		{ questionType: 'freetext',
         questionHTML: '<p style="color:red;">What or is the snow?</p>',
         correctAnswerString: 'white',
         correctAnswerOutput: 'Correct!',
         incorrectAnswerOutput: 'Try again.',
         showAnswerOutput: 'Our search expert says: white!'
        },

        '<b>Letra <i>negrita</i></b> que introduce la pregunta',

        { questionType:'multiple choice',
         questionHTML:'<b>Tienes mucho feeling?</b>',
         choices: [
             ['Puede', false, '"A" is wrong, try again.'],
             ['Algo pero no mucho', true, '"B" is correct!'],
             ['Depende como lo veas', false, '"C" is wrong, try again.'],
             ['Por supuesto!', false, '"D" is wrong, try again.']
         ]
        },

        { questionType: 'multiple choice group',
         questionGroupHTML: '<p>This section will test you on colors and numbers.</p>',
         questionsList: [
             {questionHTML: 'Pick all <i>odd</i> numbers:',
              choices: ['1', '2', '3', '4', '5'], correctIndex: [0, 2, 4]},
             {questionHTML: 'Pick one <i>even</i> number:',
              choices: ['1', '2', '3', '4', '5'], correctIndex: [1, 3],
              multiSelect: false},
             {questionHTML: 'What color is the sky?',
              choices: ['#00FF00', '#00FF00', '#0000FF'], correctIndex: 2}
         ],
         allCorrectMinCount: 2,
         allCorrectOutput: 'Great job! You know the material well.',
         someIncorrectOutput: 'You must answer at least two questions correctly.'
        },
  
];
