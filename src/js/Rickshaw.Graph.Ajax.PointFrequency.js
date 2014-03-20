Rickshaw.namespace('Rickshaw.Graph.Ajax.PointFrequency');

Rickshaw.Graph.Ajax.PointFrequency = Rickshaw.Class.create( Rickshaw.Graph.Ajax, {

  initialize: function(args) {

    if (!args.leftElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a left element";
    if (!args.rightElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a right element";
    if (!args.selectorElement) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a selector element";
    if (!args.element) throw "Rickshaw.Graph.Ajax.PointFrequency needs a reference to a graph element";

    this.args = args;

    this.dataURL = args.dataURL;
    this.ajaxType = args.ajaxType || "POST";
    
    if (this._isSelectFreqValid(args.selectedFrequency)) {
      this.selectedFrequency = args.selectedFrequency;
    } else {
      this.selectedFrequency = "week";
    }
    this.pointFrequency = this._calcPointFrequency(this.selectedFrequency);
    this.minDate = this._calcMinBoundery();
    this.maxDate = this._calcMaxBoundery();
    this.endDate = args.endDate || this.maxDate;
    this.startDate = args.startDate || moment(this.endDate).subtract(this.selectedFrequency, 1).format();
    
    this.leftElement = args.leftElement;
    this.rightElement = args.rightElement;
    this.selectorElement = args.selectorElement;

    this.onData = args.onData || function(d) { return d };
    this.onComplete = args.onComplete || function() {};
    this.onError = args.onError || function() {};


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
      
      // If the current option is the default one, set it active.
      if (listOptions[i] == this.selectedFrequency) {
        anchor.classList.add('active');
      }

      line.addEventListener('click', function(e) {
        // If the selecteted frequency is the current or is not valide, don't fire a new ajax call.
        if ((this.getAttribute("data-freq") != self.selectedFrequency) && (self._isSelectFreqValid(this.getAttribute("data-freq")))) {
          self.selectedFrequency = this.getAttribute("data-freq");
          self.pointFrequency = self._calcPointFrequency(self.selectedFrequency);
          self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
          self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
          self.request();
          // Set the new selected frequency as active and remove active from others
          // jQuery is supposed to be enable
          $(".selectorUl > li > a").removeClass("active");
          this.getElementsByTagName('a')[0].classList.add("active");
        }
      }); 

      line.appendChild(anchor);
      selectList.appendChild(line);
    }


    leftAnchor.addEventListener('click', function(e) {
      self.minDate = self._calcMinBoundery() || self.minDate;
      if(moment(self.startDate) != moment(self.minDate)){
        self.endDate = self.startDate;
        self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
        self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
        if(moment(self.startDate) < moment(self.minDate)){
          self.startDate = self.minDate;
          self.endDate = moment(self.startDate).add(self.selectedFrequency, 1).format();
        }
        self.request();
      }
    });

    rightAnchor.addEventListener('click', function(e) {
      self.maxDate = self._calcMaxBoundery() || self.maxDate;
      // Little hack for some reason, "if(moment(self.endDate) != moment(self.maxDate))" is always true, still wonder why?
      if(Math.abs(moment(self.endDate)-moment(self.maxDate)) > 0.0001){
        self.dataURL = "/sensors/"+Rickshaw.Graph.Ajax.genURL(self.args.series)+"/sensor_data";
        self.startDate = self.endDate;
        self.endDate = moment(self.endDate).add(self.selectedFrequency, 1).format();
        if(moment(self.endDate) > moment(self.maxDate)){
          self.endDate = self.maxDate;
          self.startDate = moment(self.endDate).subtract(self.selectedFrequency, 1).format();
        }
        self.request();
      }
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

  _calcMinBoundery: function(){
    var minDate;
    this.args.series.forEach(function(s){
      if((s.is_data)&&(s.minDate)){
        minDate = s.minDate;
        return;
      }
    });
    this.args.series.forEach(function(s){
      if ((s.is_data)&&(s.minDate < minDate)) {
        minDate = s.minDate;
      }
    });
    return minDate;
  },

  _calcMaxBoundery: function(){
    var maxDate;
    this.args.series.forEach(function(s){
      if((s.is_data)&&(s.maxDate)){
        maxDate = s.maxDate;
        return;
      }
    });
    this.args.series.forEach(function(s){
      if ((s.is_data)&&(s.maxDate > maxDate)) {
        maxDate = s.maxDate;
      }
    });
    return maxDate;
  },

  _isSelectFreqValid: function(toTest){
    if ((toTest=="day")||(toTest=="week")||(toTest=="month")||(toTest=="year"))
      return true;
    else
      return false; 
  }
});

Rickshaw.Graph.Ajax.PointFrequency.fillAvg = function(series, fill) {

  var x;
  var pt1;
  var pt2;
  var avg = fill;
  var i = 0;

  var data = series.map( function(s) { return s.data } );

  while ( i < Math.max.apply(null, data.map( function(d) { return d.length } )) ) {

    x = Math.min.apply( null, 
      data
        .filter(function(d) { return d[i] })
        .map(function(d) { return d[i].x })
    );
    data.forEach( function(d) {
      if (!d[i] || d[i].x != x) {
        var pt1 = (typeof(d[i])==='object')? d[i].y: ((typeof(d[i-1])==='object')? d[i-1].y: fill);
        var pt2 = (typeof(d[i-1])==='object')? d[i-1].y: ((typeof(d[i])==='object')? d[i].y: fill);
        avg = (pt1+pt2)/2.0;
        d.splice(i, 0, { x: x, y: (avg) });
      }
    } );

    i++;
  }
};


