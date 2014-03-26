NODE_PREFIX=$(shell npm prefix)
NODE_MODULES=$(NODE_PREFIX)/node_modules

CSS_MIN=$(NODE_MODULES)/.bin/cleancss
JS_MIN=$(NODE_MODULES)/.bin/uglifyjs
JS_HINT=$(NODE_MODULES)/.bin/jshint
D3=$(NODE_MODULES)/d3
MOMENT=$(NODE_MODULES)/moment
JSDOM=$(NODE_MODULES)/jsdom
NODEUNIT=$(NODE_MODULES)/nodeunit

RICKSHAW_GEM_FILE= /Users/Jeremie/.rvm/gems/ruby-2.0.0-p247/bundler/gems/rickshaw_rails-c74265abafc1/app/assets/javascripts/rickshaw.js
RICKSHAW_GIT_FILE= /Users/Jeremie/Dropbox/ENSEIRB/2A/S7/PFA/free-ecobox/src/rickshaw_rails/app/assets/javascripts/rickshaw.js

CSS_FILES=\
	src/css/detail.css\
	src/css/graph.css\
	src/css/legend.css\

JS_FILES=\
	src/js/Rickshaw.js\
	src/js/Rickshaw.Class.js\
	src/js/Rickshaw.Compat.ClassList.js\
	src/js/Rickshaw.Graph.js\
	src/js/Rickshaw.Fixtures.Color.js\
	src/js/Rickshaw.Fixtures.RandomData.js\
	src/js/Rickshaw.Fixtures.Time.js\
	src/js/Rickshaw.Fixtures.Time.Local.js\
	src/js/Rickshaw.Fixtures.Number.js\
	src/js/Rickshaw.Color.Palette.js\
	src/js/Rickshaw.Graph.Ajax.js\
	src/js/Rickshaw.Graph.Ajax.PointFrequency.js\
	src/js/Rickshaw.Graph.Annotate.js\
	src/js/Rickshaw.Graph.Axis.Time.js\
	src/js/Rickshaw.Graph.Axis.X.js\
	src/js/Rickshaw.Graph.Axis.Y.js\
	src/js/Rickshaw.Graph.Axis.Y.Scaled.js\
	src/js/Rickshaw.Graph.Behavior.Series.Highlight.js\
	src/js/Rickshaw.Graph.Behavior.Series.Order.js\
	src/js/Rickshaw.Graph.Behavior.Series.Toggle.js\
	src/js/Rickshaw.Graph.HoverDetail.js\
	src/js/Rickshaw.Graph.JSONP.js\
	src/js/Rickshaw.Graph.Legend.js\
	src/js/Rickshaw.Graph.Legend.Typed.js\
	src/js/Rickshaw.Graph.RangeSlider.js\
	src/js/Rickshaw.Graph.RangeSlider.Preview.js\
	src/js/Rickshaw.Graph.Renderer.js\
	src/js/Rickshaw.Graph.Renderer.Line.js\
	src/js/Rickshaw.Graph.Renderer.Stack.js\
	src/js/Rickshaw.Graph.Renderer.Bar.js\
	src/js/Rickshaw.Graph.Renderer.Area.js\
	src/js/Rickshaw.Graph.Renderer.ScatterPlot.js\
	src/js/Rickshaw.Graph.Renderer.Multi.js\
	src/js/Rickshaw.Graph.Renderer.LinePlot.js\
	src/js/Rickshaw.Graph.Smoother.js\
	src/js/Rickshaw.Graph.Socketio.js\
	src/js/Rickshaw.Series.js\
	src/js/Rickshaw.Series.FixedDuration.js\

.PHONY: clean build

build: rickshaw.min.css rickshaw.min.js movefile

clean:
	rm -rf rickshaw.css rickshaw.js rickshaw.min.*

test: $(D3) $(MOMENT) $(JSDOM) $(NODEUNIT)
	npm test

$(JS_HINT):
	npm install jshint

$(CSS_MIN):
	npm install clean-css

$(JS_MIN):
	npm install uglify-js

$(D3):
	npm install d3

$(MOMENT):
	npm install moment

$(JSDOM):
	npm install jsdom

$(NODEUNIT):
	npm install nodeunit

rickshaw.css: $(CSS_FILES)
	cat $(CSS_FILES) > rickshaw.css

rickshaw.js: $(JS_FILES) $(JS_HINT)
	$(JS_HINT) src/js
	cat $(JS_FILES) > rickshaw.js

rickshaw.min.css: $(CSS_MIN) rickshaw.css
	$(CSS_MIN) rickshaw.css > rickshaw.min.css

rickshaw.min.js: $(JS_MIN) rickshaw.js
	$(JS_MIN) --reserved-names "\$$super" rickshaw.js > rickshaw.min.js

movefile:
	cp rickshaw.js $(RICKSHAW_GEM_FILE)
	cp rickshaw.js $(RICKSHAW_GIT_FILE)
