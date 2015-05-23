var React = require('react');
var d3 = require('d3');

var Router = require('react-router'); // or var Router = ReactRouter; in browsers

var { DefaultRoute, Link, Route, RouteHandler } = Router;

var routes = (
  <Route handler={App} path="/">
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('#app'));
});

var App = React.createClass({
  data() {
    return d3.range(0, 100).map((id) => ({ id, data: d3.range(100).map(x => ({ x, y: Math.random() * 100 })) }));
  },

  render() {
    return (<div><h2>Is React Really Fast Yet?</h2><p>Apparently so...</p>{ this.data().map(({id, data}) => (<AppGraph key={id} data={data}/>)) }</div>);
  }
})

var AppGraph = React.createClass({
  render() {
    var xAxisHeight = 20;
    var yAxisWidth = 50;
    return (
    <NfGraph minX="0" maxX="100" topY="100" bottomY="0" width="200" height="100"
      marginBottom={xAxisHeight}
      marginLeft={yAxisWidth}
      marginRight="10"
      marginTop="10">
        <NfGraphContent>
          <NfLine data={this.props.data}/>
        </NfGraphContent>
      <NfXAxis height={xAxisHeight} count="8" templateFn={(tick) => <text>{tick}</text>}/>
      <NfYAxis width={yAxisWidth} count="5" templateFn={(tick) => <text>{tick}</text>}/>
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

  renderChildren() {
    return React.Children.map(this.props.children, function(child) {
      return child.type.needsGraph ? React.cloneElement(child, { graph: this }) : child
    }.bind(this));
  },

  render() {
    var width = this.width();
    var height = this.height();

    return (<div><svg className="nf-graph" width={width} height={height}>
      <rect className="nf-graph-bg" x="0" y="0" width={width} height={height}/>
      {this.renderChildren()}
    </svg></div>);
  }
});

var NfGraphContent = React.createClass({
  renderChildren() {
    return React.Children.map(this.props.children, function(child) {
      return  child.type.needsGraph ? React.cloneElement(child, { graph: this.props.graph }) : child;
    }.bind(this));
  },

  render() {
    var graph = this.props.graph;
    return (<g transform={`translate(${graph.graphX()},${graph.graphY()})`}>
      <rect className="nf-graph-content-bg" x="0" y="0" width={graph.graphWidth()} height={graph.graphHeight()}/>
      {this.renderChildren()}
    </g>);
  }
});

NfGraphContent.needsGraph = true;

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

NfLine.needsGraph = true;

var NfXAxis = React.createClass({
  height() {
    return Number(this.props.height);
  },

  ticks() {
    if(this.props.graph) {
      var graph = this.props.graph;
      var xOffset = graph.graphX();
      var scaleX = graph.scaleX();
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
    var ticks = this.ticks();

    return (<g className="nf-x-axis">{ticks.map((tick, i) => (
      <g key={i} className="nf-x-axis-tick" transform={`translate(${tick.x},${tick.y})`}>
        {this.props.templateFn(tick.value)}
      </g>))
    }</g>);
  }
});

NfXAxis.needsGraph = true;

var NfYAxis = React.createClass({
  width() {
    return Number(this.props.width);
  },

  ticks() {
    if(this.props.graph) {
    if(this.props.graph) {
      var graph = this.props.graph;
      var yOffset = graph.graphY();
      var scaleY = graph.scaleY();
      var x = this.width() - 5;
      return scaleY.ticks(Number(this.props.count) || 5)
        .map(tick => ({
          y: scaleY(tick) + yOffset,
          value: tick,
          x
        }));
    }
    return [];
    }
  },

  render() {
    var ticks = this.ticks();
    return (<g className="nf-y-axis">{ticks.map((tick, i) => (
      <g key={i} className="nf-y-axis-tick" transform={`translate(${tick.x},${tick.y})`}>
        {this.props.templateFn(tick.value)}
      </g>))
    }</g>);
  }
});

NfYAxis.needsGraph = true;

React.render(<App/>, document.querySelector('#app'));