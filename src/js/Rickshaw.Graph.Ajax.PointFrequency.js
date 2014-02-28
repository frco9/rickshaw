Rickshaw.namespace('Rickshaw.Graph.Ajax.PointFrequency');

Rickshaw.Graph.Ajax.PointFrequency = Rickshaw.Class.create( Rickshaw.Graph.Ajax, {

  initialize: function(args) {

    if (!args.leftElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a left element";
    if (!args.rightElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a right element";
    if (!args.selectorElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a selector element";
    if (!args.element) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a graph element";

    this.dataURL = args.dataURL;
    this.ajaxType = args.ajaxType || "POST";
    
    this.selectedFrequency = this._isSelectFreqValid(args.selectedFrequency, "week");
    this.pointFrequency = this._calcPointFrequency(this.selectedFrequency);
    this.endDate = args.endDate || moment().format();
    this.startDate = args.startDate || moment(this.endDate).subtract(this.selectedFrequency, 1).format();
    
    this.leftElement = args.leftElement;
    this.rightElement = args.rightElement;
    this.selectorElement = args.selectorElement;

    this.onData = args.onData || function(d) { return d };
    this.onComplete = args.onComplete || function() {};
    this.onError = args.onError || function() {};

    this.args = args;

    this.render();

    // this.graph.onUpdate(function() {});
    this.request();
  },

  request: function() {

    $.ajax( {
      type: this.ajaxType,
      url: this.dataURL,
      data: {
        pointFrequency: this.pointFrequency,
        startDate: this.startDate,
        endDate: this.endDate
      },
      dataType: 'json',
      success: this.success.bind(this),
      error: this.error.bind(this)
    } );
  },

  render: function() {
    var self = this;

    var leftAnchor = document.createElement('a');
    leftAnchor.className = "glyphicon glyphicon-chevron-left";
    this.leftElement.appendChild(leftAnchor);
    
    var rightAnchor = document.createElement('a');
    rightAnchor.className = "glyphicon glyphicon-chevron-right";
    this.rightElement.appendChild(rightAnchor);

    var selectList = document.createElement('ul');
    selectList.className = "selectorUl list-inline";
    this.selectorElement.appendChild(selectList);
    var listOptions = ["day", "week", "month", "year"];
    var listTitles = ["Jour", "Semaine", "Mois", "Année"];
    for(var i=0; i<listOptions.length; i++) {
      var line = document.createElement('li');
      line.dataset.freq = listOptions[i];
      var anchor = document.createElement('a');
      anchor.innerHTML = listTitles[i];
      
      line.addEventListener('click', function(e) {
        self.selectedFrequency = self._isSelectFreqValid(this.getAttribute("data-freq"), "week");
        self.pointFrequency = self._calcPointFrequency(self.selectedFrequency);
        self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
        self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
        self.request();
      });  
      line.appendChild(anchor);
      selectList.appendChild(line);
    }


    leftAnchor.addEventListener('click', function(e) {
      self.endDate = self.startDate;
      self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
      self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
      self.request();
    });
    rightAnchor.addEventListener('click', function(e) {
      self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
      self.startDate = self.endDate;
      self.endDate = moment(self.endDate).add(self.selectedFrequency, 1).format();
      if(moment(self.endDate) > moment()){
        self.endDate = moment().format();
        self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
      }
      self.request();
    });
  },

  _calcPointFrequency: function(frequency){
    switch (frequency){
      case "day":
        return "minute";
      case "week":
        return "hour";
      case "month":
        return "hour";
      case "year":
        return "day";
    }
  },

  _isSelectFreqValid: function(toTest, defaultVal){
    if ((toTest=="day")||(toTest=="week")||(toTest=="month")||(toTest=="year"))
      return toTest;
    else
      return defaultVal; 
  }
});


