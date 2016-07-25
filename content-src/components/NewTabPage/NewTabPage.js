const React = require("react");
const {connect} = require("react-redux");
const {selectNewTabSites} = require("selectors/selectors");
const TopSites = require("components/TopSites/TopSites");
const GroupedActivityFeed = require("components/ActivityFeed/ActivityFeed");
const Spotlight = require("components/Spotlight/Spotlight");
const Loader = require("components/Loader/Loader");
const {actions} = require("common/action-manager");
const {Link} = require("react-router");
const classNames = require("classnames");

const MAX_TOP_ACTIVITY_ITEMS = 10;
const PAGE_NAME = "NEW_TAB";

const NewTabPage = React.createClass({
  getInitialState() {
    return {
      showSettingsMenu: false,
      renderedOnce: false
    };
  },
  toggleRecommendation() {
    this.props.dispatch(actions.NotifyEvent({
      event: "TOGGLE_RECOMMENDATION",
      page: PAGE_NAME
    }));
    this.props.dispatch(actions.NotifyToggleRecommendations());
    this.props.dispatch(actions.RequestHighlightsLinks());
  },
  componentDidUpdate() {
    if (this.props.isReady && !this.state.renderedOnce) {
      this.props.dispatch(actions.NotifyPerf("NEWTAB_RENDER"));
      this.setState({renderedOnce: true});
    }
  },
  render() {
    const props = this.props;
    return (<main className="new-tab">
      <div className="new-tab-wrapper">

        <div className={classNames("show-on-init", {on: this.props.isReady})}>
          <section>
            <TopSites page={PAGE_NAME} sites={props.TopSites.rows} />
          </section>

          <section>
            <Spotlight page={PAGE_NAME} sites={props.Spotlight.rows} />
          </section>

          <section>
            <h3 ref="title" className="section-title">Recent Activity</h3>
            <GroupedActivityFeed sites={props.TopActivity.rows} length={MAX_TOP_ACTIVITY_ITEMS} page={PAGE_NAME} maxPreviews={10} />
          </section>

        </div>
      </div>
    </main>);
  }
});

NewTabPage.propTypes = {
  TopSites: React.PropTypes.object.isRequired,
  Spotlight: React.PropTypes.object.isRequired,
  TopActivity: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

module.exports = connect(selectNewTabSites)(NewTabPage);
module.exports.NewTabPage = NewTabPage;
