fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var mongoHost = ''

fs.readFile('watson-sample2.json', 'utf8', function(err,data){


  var jsondata = JSON.parse(data);

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
    candidate: 'clinton',
    personality: [pMaxText[0], pMaxText[1], pMaxText[2]],
    needs: nMaxText,
    values: vMaxText
  };

  console.log(JSON.stringify(out));

  MongoClient.connect(mongoHost, function(err, db){
    if(err) throw err;

    var coll = db.collection('sentiment');

    coll.deleteOne({candidate: 'clinton'}, function(err, result){
      coll.insert(out, function(err, result){
        db.close();
      });
    })


  });


});
