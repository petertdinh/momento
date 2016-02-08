import React, {
  AsyncStorage,
  StyleSheet,
  Component,
  Text,
  View,
  Dimension,
  NativeModules
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import {
Home,
CameraView,
Capture,
Library,
Story,
NewStory,
EditMoment,
LogIn,
SignUp,
LogOut,
Moment,
} from '../components';

//import LogInFail from '../components/logInFail';
//router for the app
class EpiLogApp extends Component {
  componentWillMount(){
    const {storiesState, storiesActions} = this.props
    if ((storiesState.lastUpdated === undefined && !storiesState.loading) || 
      // or the last time we updated was 5 minutes ago
      // will evaluate to false if lastUpdated is undefined. YAY JS!
      (Date.now() - storiesState.lastUpdated) > (60 * 1000)){
        storiesActions.fetchStories();
    }
  }

  render() {
    // Be explicit about what is available as props
    const {
      viewControlState, viewControlActions,
      storiesState, storiesActions,
      authState, authActions,
      momentViewState, momentViewActions,
      commentState, commentActions,
    } = this.props;

    switch (viewControlState.currentView) {
      case "CAMERAVIEW":
        return (
          <CameraView
          onTakePicture={ () => {viewControlActions.setView('CAPTURE')}}
          />
          );
      case "HOME":
        return (
          <Home
          onCamera={ () => {viewControlActions.setView('CAMERAVIEW') }}
          onLogOut={ () => {viewControlActions.setView('LOGOUT') }}
          />);
      case "LOGIN":
        return (
          <LogIn
          successLoggedIn={ () => { viewControlActions.setView('HOME') }}
          onSignUp={ () => { viewControlActions.setView('SIGNUP') }}
          />);
      case "SIGNUP":
        return (
          <SignUp
          successSignedUp={ () => { viewControlActions.setView('HOME') }}
          onLogIn={ () => { viewControlActions.setView('LOGIN') }}
          />);
      case "LOGOUT":
        return (
          <LogOut
          successLoggedOut={ () => { viewControlActions.setView('LOGIN') }}
          successGotHome={ () => {
            viewControlActions.setView('HOME') }}
          />);
      case "LIBRARY":
        return (
          <Library
          stories={storiesState}
          onTouchImage={ (asset) =>{ viewControlActions.setView('STORY', { asset: asset }) }}
          />);
      case "STORY":
        return (
          <Story
          asset={viewControlState.passedProps.asset}
          onBack={ () => { viewControlActions.setView('LIBRARY') }}
          onPress={(moment) => viewControlActions.setView('MOMENT_VIEW', {moment: moment})}
          />);
      case "NEW_STORY":
        return (
          <NewStory
          asset={viewControlState.passedProps.asset}
          storyTitle={viewControlState.passedProps.storyTitle}
          onBack={()=>{viewControlActions.setView('CAPTURE')}}
          onSubmit={()=>{
            viewControlActions.setView('LIBRARY');
          }}
          />
        );
      case "CAPTURE":
        return (
          <Capture
          onTouchImage={ (asset) => { viewControlActions.setView('EDIT_MOMENT', { asset: asset }); }}
          />);
      case "EDIT_MOMENT":
        return(<EditMoment
          asset={viewControlState.passedProps.asset}
          onCancel={()=>{viewControlActions.setView('CAPTURE')}}
          onSubmit={(redirect, asset)=>{
              if (redirect === 'HOME') {
                viewControlActions.setView('HOME');
              } else {
                viewControlActions.setView('NEW_STORY', { asset: asset });
              }
            }
          }
        />);
      case "MOMENT_VIEW":
        return(<Moment
          fetchComments={commentActions.fetchComments}
          comments={commentState.fetchedComments}
          submitComment={commentActions.submitComment}
          submitStatus={commentState.submitComment}
          moment={viewControlState.passedProps.moment}
          commentsVisibility={momentViewState.commentsVisibility}
          setCommentsVisibility={momentViewActions.setCommentsVisibility}
        />);
      default:
        return <LogIn />;
    }
  }
}

export default connect(state => ({
    viewControlState: state.viewControl,
    storiesState: state.stories,
    authState: state.authControl,
    momentViewState: state.momentViewControl,
    commentState: state.commentData
  }),
  (dispatch) => ({
    viewControlActions: bindActionCreators(actions.viewControlActions, dispatch),
    storiesActions: bindActionCreators(actions.storiesActions, dispatch),
    authActions: bindActionCreators(actions.authActions, dispatch),
    thunkFetch: bindActionCreators(actions.thunkFetch, dispatch),
    momentViewActions: bindActionCreators(actions.momentViewControlActions, dispatch),
    commentActions: bindActionCreators(actions.commentDataActions, dispatch),
  })
)(EpiLogApp);

