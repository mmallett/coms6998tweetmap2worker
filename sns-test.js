
var aws = require('aws-sdk');

aws.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-west-2'
});

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


//
