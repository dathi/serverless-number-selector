'use strict';

const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();

module.exports.positiveNumber = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'This is positive number!',
      input: event,
    }, null, 2),
  };
};

module.exports.negativeNumber = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'This is negative number!',
      input: event,
    }, null, 2),
  };
};

module.exports.executeStepFunction = (event, context, callback) => {
  console.log('Trigger Step Function...', event);

  const number = event.queryStringParameters.number;
  console.log('Input number: ' + number);

  callStepFunction(number).then(result => {
    let message = 'Step function is executing';
    if (!result) {
      message = 'Step function is not executing';
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message })
    };

    callback(null, response);
  });
};

function callStepFunction(number) {
  console.log('callStepFunction');

  const stateMachineName = 'numberSelector';
  console.log('Fetching the list of available workflows');

  return stepFunctions.listStateMachines({}).promise().then(listStateMachines => {
    console.log('Searching for the step function', listStateMachines);
    for (let i = 0; i < listStateMachines.stateMachines.length; i++) {
      const item = listStateMachines.stateMachines[i];

      if (item.name.indexOf(stateMachineName) >= 0) {
        console.log('Found the state machine', item);

        var params = {
          stateMachineArn: item.stateMachineArn,
          input: JSON.stringify({ value: parseInt(number) })
        };

        console.log('Start execution with params:', params);
        return stepFunctions.startExecution(params).promise().then(() => {
          console.log('Executed state mechine...');
          return true;
        });

      }
    }
  }).catch(error => {
    console.log('error:', error.message);
    return false;
  });

}