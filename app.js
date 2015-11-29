var MongoClient = require('mongodb').MongoClient;
var aws = require('aws-sdk');
var watson = require('watson-developer-cloud');

var personality_insights = watson.personality_insights({
  username: '',
  password: '',
  version: 'v2'
});

aws.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-west-2'
});

var sqs = new aws.SQS();

var mongoHost = ''

var params = {
  QueueUrl: '',
  MaxNumberOfMessages: 1,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 3,
  MessageAttributeNames: ['.']
};


var candidateText = {
  clinton : '',
  sanders: '',
  trump: '',
  carson: '',
  bush: '',
  rubio: '',
  fiorina: '',
  cruz: ''
}

function receive(){
  sqs.receiveMessage(params, function(err, data){
    if(err) console.log(err, err.stack);
    else{

      if(data.Messages){


        var message = data.Messages[0];
        var body = JSON.parse(message.Body);

        // console.log(body.text);

        var candidate = body.candidate;

        candidateText[candidate] += body.text + ' ';



        var words = candidateText[candidate].split(' ').length;


        if(words > 10000){
          console.log(candidate);

          personality_insights.profile({
            text: candidateText[candidate],
            language: 'en' },
            function (err, response) {

              if (err){
                console.log('error:', err);
              }
              else{

                // console.log(JSON.stringify(response, null, 2));
                process(response, candidate);
              }
              candidateText[candidate] = '';

          });

        }


        var receiptHandle = message.ReceiptHandle;
        sqs.deleteMessage({
          QueueUrl: '',
          ReceiptHandle: receiptHandle
        }, function(err, data){
          if(err) console.log(err, err.stack);
          else{

              receive();

          }
        });


      }
      else{
        receive();
      }

    }
  });
}

function process(jsondata, candidate){

  var personality,
      needs,
      values;

  for(var i=0; i<jsondata.tree.children.length; i++){
    if(jsondata.tree.children[i].id == 'personality'){
      personality = jsondata.tree.children[i].children[0];
    }
    if(jsondata.tree.children[i].id == 'needs'){
      needs = jsondata.tree.children[i].children[0];
    }
    if(jsondata.tree.children[i].id == 'values'){
      values = jsondata.tree.children[i].children[0];
    }

  }

  var pMax = [0,0,0];
  var pMaxText = ['','',''];
  var nMax = 0;
  var nMaxText = '';
  var vMax = 0;
  var vMaxText = '';

  for(var i=0; i<personality.children.length; i++){
    // console.log(personality.children[i].id);
    for(var j=0; j<personality.children[i].children.length; j++){
      // console.log('  ' + personality.children[i].children[j].id);
      var item = personality.children[i].children[j];
      for(var k=pMax.length-1; k>=0; k--){
        if(item.percentage > pMax[k]){
          if(k<pMax.length-1){
            pMax[k+1] = pMax[k];
            pMaxText[k+1] = pMaxText[k];
          }
          pMax[k] = item.percentage;
          pMaxText[k] = item.id;
        }
      }
    }

  }

  for(var i=0; i<needs.children.length; i++){
    // console.log(needs.children[i].id);
    var item = needs.children[i];
    if(item.percentage > nMax){
      nMax = item.percentage;
      nMaxText = item.name;
    }
  }

  for(var i=0; i<values.children.length; i++){
    // console.log(values.children[i].id);
    var item = values.children[i];
    if(item.percentage > vMax){
      vMax = item.percentage;
      vMaxText = item.name;
    }
  }


  var out = {
    candidate: candidate,
    personality: [pMaxText[0], pMaxText[1], pMaxText[2]],
    needs: nMaxText,
    values: vMaxText
  };

  MongoClient.connect(mongoHost, function(err, db){
    if(err) throw err;

    var coll = db.collection('sentiment');

    coll.deleteOne({candidate: candidate}, function(err, result){
      coll.insert(out, function(err, result){
        db.close();
        snsPublish();
      });
    })


  });


}

receive();


function snsPublish(){
  var sns = new aws.SNS();
  var params = {
    Message: 'sentiment', /* required */
    MessageAttributes: {
      someKey: {
        DataType: 'String', /* required */
        StringValue: 'sentiment'
      },
      /* anotherKey: ... */
    },
    Subject: 'sentiment',
    TopicArn: ''
  };
  sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}
