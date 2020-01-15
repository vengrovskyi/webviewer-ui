import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import Measure from 'react-measure';
import classNames from 'classnames';

import core from 'core';
import selectors from 'selectors';
import actions from 'actions';

import TreeView from 'devextreme-react/tree-view';
import SelectBox from 'devextreme-react/select-box';

import { products } from './data.js';

import './DocumentTreePanel.scss';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
class DocumentTreePanel extends React.PureComponent {

  constructor() {
    super();
    this.listRef = React.createRef();
    this.settings = {
      value: 'contains',
      treeData: products //[]
    };
   }

  componentDidMount() {
    core.addEventListener('beginRendering', this.onBeginRendering);
    core.addEventListener('finishedRendering', this.onFinishedRendering);
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('viewerLoaded', this.onViewerLoaded);
  }

  componentWillUnmount() {
    core.removeEventListener('beginRendering', this.onBeginRendering);
    core.removeEventListener('finishedRendering', this.onFinishedRendering);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('viewerLoaded', this.onViewerLoaded);
  }

  onViewerLoaded = () => {
    let customDataString = window.readerControl.getCustomData()
    if(customDataString!=null){
      let customData = JSON.parse(customDataString);
      if(customData.documentTree!=null){
        this.settings.treeData = customData.documentTree;        
      }
    }
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
      <React.Fragment>
        <TreeView
              id="treeview"
              items={this.settings.treeData}
              searchMode={this.settings.value}
              searchEnabled={true}
              onItemClick={this.selectItem}
              itemRender={this.renderTreeViewItem}
            />
      </React.Fragment>
      </div>

    );
  }

  selectItem(e) {
    let currentItem= Object.assign({}, e.itemData);
    currentItem.documentUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";
    currentItem.documentExtension = "pdf"
    if(currentItem.documentUrl){
      window.readerControl.loadDocument(currentItem.documentUrl, {extension: currentItem.documentExtension})
    }
  }

  renderTreeViewItem(value) {
    return (<div><img src={(value.icon ? ` ($${value.icon})` : '')} />{value.text}</div>);
  }
}

const mapDispatchToProps = dispatch => ({
    dispatch,
  });
  
  const mapStateToProps = state => ({
    isDisabled: selectors.isElementDisabled(state, 'thumbnailsPanel')   });
  
  export default connect(mapStateToProps, mapDispatchToProps)(DocumentTreePanel);