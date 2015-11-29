var watson = require('watson-developer-cloud');

var personality_insights = watson.personality_insights({
  username: '',
  password: '',
  version: 'v2'
});


var text = 'Spark is a distributed programming framework developed at Berkeley. It is somewhat similar to MapReduce in that it provides a high level interface with programming abstractions that enable the developer to focus on algorithms instead of cluster management. The core feature of Spark is Resilient Distributed Datasets (RDD). These are read­only datasets partitioned across multiple machines, where any one partition can be easily rebuilt if it is lost. RDDs are either the result of reading some static content (HDFS etc), or the result of some operation (filter lines that contain “ERRORS”). The RDDs are actually not persisted by default, you must use the cache operation to do so. This makes Spark much faster than MapReduce for algorithms with many iterations, such as machine learning algorithms.\
Spark is implemented in Scala, a functional language built to run on JVM. The Spark programming model is functional in nature. The programmer gives a set of Scala closures (or functions) to the framework, and the RDDs are the immutable output of those operations. This is where Scala gets much of its speed. It only needs to keep the functions around, and it can quickly follow a chain of functions to rebuild a partition of it is lost, whereas if MapReduce loses a partition, you must redo the entire operation, which includes multiple extremely expensive disk operations on the entire dataset. Spark leverages Mesos distributed operating system to do most of the distributed orchestration work, which they claim greatly simplified Spark’s programming effort.\
Overall, Spark seems to be an interesting alternative to MapReduce and other popular distributed programming models. It is especially notable for its speed, functional approach to programming, and ease of creating many iterations at little performance cost.'


personality_insights.profile({
  text: text,
  language: 'en' },
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});
