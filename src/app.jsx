var React = require('react');
var d3 = require('d3');

var App = React.createClass({
  data() {
    return d3.range(0, 100).map(() => d3.range(100).map(x => ({ x, y: Math.random() * 100 })));
  },

  render() {
    return (<div>{ this.data().map(d => (<AppGraph data={d}/>)) }</div>);
  }
})

var AppGraph = React.createClass({
  render() {
    return (<NfGraph minX="0" maxX="100" topY="100" bottomY="0" width="200" height="100">
      <NfLine data={this.props.data}/>
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
    return [0, this.width()];
  },

  rangeY() {
    return [this.height(), 0];
  },


  scaleX() {
    return d3.scale.linear().domain(this.domainX()).range(this.rangeX());
  },

  scaleY() {
    console.log(this.domainY(), this.rangeY());
    return d3.scale.linear().domain(this.domainY()).range(this.rangeY());
  },


  render() {
    this.props.children.props.graph = this;
    return (<svg className="nf-graph" width={this.width()} height={this.height()}>{this.props.children}</svg>);
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

React.render(<App/>, document.querySelector('#app'));