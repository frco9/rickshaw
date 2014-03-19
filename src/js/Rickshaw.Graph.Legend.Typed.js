Rickshaw.namespace('Rickshaw.Graph.Legend.Typed');

Rickshaw.Graph.Legend.Typed = Rickshaw.Class.create( Rickshaw.Graph.Legend, {


	initialize: function($super, args) {
		this.introText = args.introText || "Select sensors to display";
    $super(args);
	},

  render: function() {
    var self = this;

    // Remove ul node added in parent class constructor.
    this.list.remove();

    // Add div node to element corresponding to legend div
    var row = document.createElement('div');
    row.classList.add('row');
    this.element.appendChild(row);
    this.element.classList.add('hidden');

    // Add headline for sensors selection div
    var introText = document.createElement('div');
    introText.classList.add('introText');
    var anchor = document.createElement('a');
    anchor.innerHTML = "<h4>"+this.introText+"</h4>";
    introText.appendChild(anchor);
    var clearfix = document.createElement('span');
    clearfix.classList.add('clearfix');
    introText.appendChild(clearfix);
    this.element.parentNode.insertBefore(introText, this.element);

    this.lines = [];

    var series = {};
    
    // Group series by data_type_id in an associative array
    // key : data_type_id
    // items : associated series
    this.graph.series
      .map( function(s) {
        // Key doesn't exist yet ?
        if (series[s.data_type_id] === undefined)
          series[s.data_type_id] = [];

        series[s.data_type_id].push(s);        
      });


    for (var key in series) {
      // Foreach types we create a node column
      var column = document.createElement('div');
      column.classList.add('col-md-3');
      column.classList.add('col-sm-6');
      column.classList.add('col-xs-12');
      row.appendChild(column);
      this.list = document.createElement('ul');
      column.appendChild(this.list);
      
      // Add the tittle of column
      if (series[key] && series[key][0]){
        var li = document.createElement('li');
        li.classList.add('type_name');
        li.appendChild(document.createTextNode(series[key][0].name.split(" - ")[1]));
        this.list.appendChild(li);
      }

      // For each series of this type we add a line to the legend
      series[key].forEach( function(s) {
        s.name = s.name.split(" - ")[0];
        self.addLine(s);
      });  

    }

    // Create legend's open button
    var openButContainer = document.createElement('div');   
    openButContainer.classList.add('openContainer');
    
    var openButLeft = document.createElement('div');   
    openButLeft.classList.add('openLeft');
    var openButRigth = document.createElement('div');   
    openButRigth.classList.add('openRight');
    
    var a = document.createElement('a');
    var openButCenter = document.createElement('div');   
    openButCenter.classList.add('openCenter');

    var span = document.createElement('span');
    span.classList.add('icon-arrow-down2');
    openButCenter.appendChild(span);

    openButContainer.appendChild(openButLeft);
    a.appendChild(openButCenter);
    openButContainer.appendChild(a);
    openButContainer.appendChild(openButRigth);

    this.element.parentNode.appendChild(openButContainer);

    // Bind an action on button click event.
    a.onclick = function(e) {
      span.classList.toggle("icon-arrow-down2");
      span.classList.toggle("icon-arrow-up2");
      this.element.classList.toggle("hidden");
      this.element.classList.toggle("show");
    }.bind(this);

    // Bind an action on introText click event.
    anchor.onclick = function(e) {
      span.classList.toggle("icon-arrow-down2");
      span.classList.toggle("icon-arrow-up2");
      this.element.classList.toggle("hidden");
      this.element.classList.toggle("show");
    }.bind(this);

  }
} );

