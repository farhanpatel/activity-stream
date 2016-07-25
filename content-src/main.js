const React = require("react");
const ReactDOM = require("react-dom");
const {Provider} = require("react-redux");

const Routes = require("components/Routes/Routes");
const Base = require("components/Base/Base");
const NewTab = require("components/NewTabPage/NewTabPage")
const store = require("./store");

// if (__CONFIG__.USE_SHIM) {
  require("lib/shim")();
// }

require("lib/ios-bridge")()

const Root = React.createClass({
  render() {
    return (<Provider store={store}>
    <Base>
      <NewTab></NewTab>
    </Base>
    </Provider>);
  }
});


 ReactDOM.render(<Root />, document.getElementById("root"));
