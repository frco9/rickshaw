Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Toggle');

Rickshaw.Graph.Behavior.Series.Toggle = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;
  this.transport = args.transport;
  this.callback = args.callback;

	var self = this;

	this.addAnchor = function(line) {
		var anchor = document.createElement('a');
		anchor.innerHTML = '&#10004;';
		anchor.classList.add('action');
		line.element.insertBefore(anchor, line.element.firstChild);

		anchor.onclick = function(e) {
			if (line.series.disabled) {
				line.series.enable();
        // Dynamically get missing data
        if (!line.series.is_data){
          self.transport.dataURL = self.transport.dataURL.replace(/([0-9]|,)+/g, line.series.id);
          line.series.is_data = true;
          self.transport.request();
          self.callback(line.series.id, true);
        }
				line.element.classList.remove('disabled');
			} else { 
				if (this.graph.series.filter(function(s) { return !s.disabled }).length <= 1) return;
				line.series.disable();
				line.element.classList.add('disabled');
        self.callback(line.series.id, false);
			}

		}.bind(this);
		
    var label = line.element.getElementsByTagName('span')[0];
    label.onclick = function(e){

      var disableAllOtherLines = line.series.disabled;
      var getAllUrl = "";
      if ( ! disableAllOtherLines ) {
        for ( var i = 0; i < self.legend.lines.length; i++ ) {
          var l = self.legend.lines[i];
          if ( line.series === l.series ) {
            // noop
          } else if ( l.series.disabled ) {
            // noop
            // Dynamically get missing data
            if (!l.series.is_data){
              getAllUrl += l.series.id + ",";
              l.series.is_data = true;
            }                                        
          } else {
            disableAllOtherLines = true;
            break;
          }
        }
        // Dynamically get missing data
        if (getAllUrl){
          getAllUrl = getAllUrl.slice(0,-1);
          self.transport.dataURL = self.transport.dataURL.replace(/([0-9]|,)+/g, getAllUrl);
          self.transport.request();
          self.callback(getAllUrl, true);
        } 
      }
      // show all or none
      if ( disableAllOtherLines ) {
        // these must happen first or else we try ( and probably fail ) to make a no line graph
        line.series.enable();
        // Dynamically get missing data
        if (!line.series.is_data){
          self.transport.dataURL = self.transport.dataURL.replace(/([0-9]|,)+/g, line.series.id);
          line.series.is_data = true;
          self.transport.request();
          self.callback(line.series.id, true);
        }
        line.element.classList.remove('disabled');

        self.legend.lines.forEach(function(l){
          if ( line.series === l.series ) {
            // noop
          } else {
            l.series.disable();
            l.element.classList.add('disabled');
            self.callback(l.series.id, false);
          }
        });

      } else {
        self.legend.lines.forEach(function(l){
          l.series.enable();
          l.element.classList.remove('disabled');
        });

      }

    };

	};

	if (this.legend) {

		if (typeof $ != 'undefined' && $(this.legend.list).sortable) {

			$(this.legend.list).sortable( {
				start: function(event, ui) {
					ui.item.bind('no.onclick',
						function(event) {
							event.preventDefault();
						}
					);
				},
				stop: function(event, ui) {
					setTimeout(function(){
						ui.item.unbind('no.onclick');
					}, 250);
				}
			});
		}

		this.legend.lines.forEach( function(l) {
			self.addAnchor(l);
		} );
	}

	this._addBehavior = function() {

		this.graph.series.forEach( function(s) {
			
			s.disable = function() {

				if (self.graph.series.length <= 1) {
					throw('only one series left');
				}
				
				s.disabled = true;
				self.graph.update();
			};

			s.enable = function() {
				s.disabled = false;
				self.graph.update();
			};
		} );
	};
	this._addBehavior();

	this.updateBehaviour = function () { this._addBehavior() };

};
