import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import Measure from 'react-measure';
import classNames from 'classnames';

import core from 'core';
import selectors from 'selectors';
import actions from 'actions';

import './DocumentTreePanel.scss';

class DocumentTreePanel extends React.PureComponent {
  static propTypes = {

  }

  constructor() {
    super();
    this.listRef = React.createRef();
  }

  componentDidMount() {
    core.addEventListener('beginRendering', this.onBeginRendering);
    core.addEventListener('finishedRendering', this.onFinishedRendering);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    core.removeEventListener('beginRendering', this.onBeginRendering);
    core.removeEventListener('finishedRendering', this.onFinishedRendering);
    window.removeEventListener('resize', this.onWindowResize);
  }

  onBeginRendering = () => {

  }

  onFinishedRendering = needsMoreRendering => {

  }


  onWindowResize = () => {

  }

  render() {
    const { display} = this.props;

     return  (
         
      <div
        className="Panel DocumentTreePanel"
        style={{ display }}
        data-element="documentTreePanel"
      >
            Hello :)
      </div>
    );
  }
 
}

const mapDispatchToProps = dispatch => ({
    dispatch,
  });
  
  const mapStateToProps = state => ({
    isDisabled: selectors.isElementDisabled(state, 'thumbnailsPanel')   });
  
  export default connect(mapStateToProps, mapDispatchToProps)(DocumentTreePanel);