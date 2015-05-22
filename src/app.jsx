var React = require('react');
var d3 = require('d3');

var App = React.createClass({
  data() {
    return d3.range(0, 1).map(() => d3.range(100).map(x => ({ x, y: Math.random() * 100 })));
  },

  render() {
    return (<div>{ this.data().map(d => (<AppGraph data={d}/>)) }</div>);
  }
})

var AppGraph = React.createClass({
  render() {
    var xAxisHeight = 20;
    var yAxisWidth = 50;
    return (<NfGraph minX="0" maxX="100" topY="100" bottomY="0" width="200" height="100"
        marginBottom={xAxisHeight}
        marginLeft={yAxisWidth}
        marginRight="10"
        marginTop="10">
        <NfGraphContent>
          <NfLine data={this.props.data}/>
        </NfGraphContent>
      <NfXAxis height={xAxisHeight} count="8" templateFn={(tick) => <text>{tick}</text>}/>
    </NfGraph>);
  }
});

var NfGraph = React.createClass({
  width() {
    return Number(this.props.width) || 200;
  },

  height() {
    return Number(this.props.height) || 100;
  },

  marginBottom() {
    return Number(this.props.marginBottom) || 0;
  },

  marginTop() {
    return Number(this.props.marginTop) || 0;
  },

  marginLeft() {
    return Number(this.props.marginLeft) || 0;
  },

  marginRight() {
    return Number(this.props.marginRight) || 0;
  },

  graphHeight() {
    return this.height() - this.marginBottom() - this.marginTop();
  },

  graphWidth() {
    return this.width() - this.marginLeft() - this.marginRight();
  },

  graphX() {
    return this.marginLeft();
  },

  graphY() {
    return this.marginTop();
  },

  leftX() {
    return Number(this.props.leftX) || 0;
  },

  rightX() {
    return Number(this.props.rightX) || 100;
  },

  topY() {
    return Number(this.props.topY) || 100;
  },

  bottomY() {
    return Number(this.props.bottomY) || 0;
  },

  domainX() {
    return [this.leftX(), this.rightX()];
  },

  domainY() {
    return [this.bottomY(), this.topY()];
  },

  rangeX() {
    return [0, this.graphWidth()];
  },

  rangeY() {
    return [this.graphHeight(), 0];
  },

  scaleX() {
    return d3.scale.linear().domain(this.domainX()).range(this.rangeX());
  },

  scaleY() {
    return d3.scale.linear().domain(this.domainY()).range(this.rangeY());
  },


  render() {
    if(Array.isArray(this.props.children)) {
      var self = this;
      this.props.children.forEach(c => c.props.graph = self);
    } else {
      this.props.children.props.graph = this;
    }
    var width = this.width();
    var height = this.height();

    return (<svg className="nf-graph" width={width} height={height}>
      <rect className="nf-graph-bg" x="0" y="0" width={width} height={height}/>
      {this.props.children}
    </svg>);
  }
});

var NfGraphContent = React.createClass({
  render() {
    var graph = this.props.graph;
    
    if(Array.isArray(this.props.children)) {
      this.props.children.forEach(c => c.props.graph = graph);
    } else {
      this.props.children.props.graph = this.props.graph;
    }

    return (<g transform={`translate(${graph.graphX()},${graph.graphY()})`}>
      <rect className="nf-graph-content-bg" x="0" y="0" width={graph.graphWidth()} height={graph.graphHeight()}/>
      {this.props.children}
    </g>);
  }
});


var NfLine = React.createClass({
  getPath() {
    if(this.props.graph) {
      var scaleX = this.props.graph.scaleX();
      var scaleY = this.props.graph.scaleY();

      var lineFn = d3.svg.line()
        .x(d => scaleX(d.x))
        .y(d => scaleY(d.y));

      return lineFn(this.props.data);
    }

    return "M0,0";
  },

  render() {
    return (<g className="nf-line">
      <path className="nf-line-path" d={this.getPath()}/>
    </g>);
  }
});

var NfXAxis = React.createClass({
  height() {
    return Number(this.props.height);
  },

  ticks() {
    if(this.props.graph) {
      var graph = this.props.graph;
      var xOffset = graph.graphX();
      var scaleX = graph.scaleX();
      var graphHeight = graph.height();
      var y = graph.height() - this.height() + 5;
      return scaleX.ticks(Number(this.props.count) || 8)
        .map(tick => ({
          x: xOffset + scaleX(tick),
          value: tick,
          y
        }));
    }
    return [];
  },

  render() {
    var graph = this.props.graph;
    var height = this.height();
    var ticks = this.ticks();

    return (<g className="nf-x-axis">{ticks.map(tick => (
      <g className="nf-x-axis-tick" transform={`translate(${tick.x},${tick.y})`}>
        {this.props.templateFn(tick.value)}
      </g>))
    }</g>);
  }
});

var NfYAxis = React.createClass({

});

React.render(<App/>, document.querySelector('#app'));