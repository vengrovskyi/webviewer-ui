import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import Measure from 'react-measure';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import core from 'core';
import selectors from 'selectors';
import actions from 'actions';

import TreeView from 'devextreme-react/tree-view';
import { Tooltip } from 'devextreme-react/tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import { faFilePdf, faFileWord, faFileExcel, faFileImage, faFile } from '@fortawesome/free-solid-svg-icons'
import { faFileAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons'

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
      treeData: [],  //products
      allowFilesDownload: false//true
    };
    this.documentTreeItemsMap = new Map();

    // if(this.settings.treeData.length>0){
    //   this.settings.treeData.forEach(element => {
    //     this.addTreeItemToMap(element);
    //   });
    // }


    this.onSelectItem = this.onSelectItem.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);
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
        if(customData.documentTree.length>0){
          customData.documentTree.forEach(element => {
            this.addTreeItemToMap(element);
          });
        } 

        this.settings.treeData = customData.documentTree; 
        this.settings.allowFilesDownload = customData.allowFilesDownload; 
        debugger;
      }
    }
  }

  onBeginRendering = () => {

  }

  onFinishedRendering = needsMoreRendering => {
  }


  onWindowResize = () => {

  }

  addTreeItemToMap = (item)=>{
    if(!this.documentTreeItemsMap.has(item.id))
    {
      this.documentTreeItemsMap.set(item.id, item);
    }

    if(item.items && item.items.length>0){
      item.items.forEach(element => {
        this.addTreeItemToMap(element);
      });
    }
  }

  onSelectItem = (e) => {
    let selectedItem = this.documentTreeItemsMap.get(e.target.id);
    // }else if(currentItem.objectUrl){
    //   window.open(currentItem.objectUrl, "_blank");
    // }

    switch(selectedItem.type){
      case 2:
      case 5: {
        if(selectedItem.documentUrl){
            window.readerControl.loadDocument(selectedItem.documentUrl, {extension: selectedItem.documentExtension, filename: selectedItem.text});
          }
        break;
      }
      case 4: {
        let warning = {
          message: "Document format is not supported by viewer.",
          title: "Warning.",
          confirmBtnText: "Ok",
          onConfirm: () => Promise.resolve(),
        };
        window.readerControl.showWarningMessage(warning);
        break;
      }
      case 6: {
        if(selectedItem.errorMessage){
             let warning = {
               message: selectedItem.errorMessage,
               title: "Error.",
               confirmBtnText: "Ok",
               onConfirm: () => Promise.resolve(),
             };
             window.readerControl.showWarningMessage(warning);
          }
        break;
      } 
    }
  }
  
  onDownloadClick = (e) => {
    let itemId = e.target.attributes.getNamedItem("itemId");
    if(!itemId){
      itemId = e.target.parentElement.attributes.getNamedItem("itemId")
    }
    if(itemId){
      let selectedItem = this.documentTreeItemsMap.get(itemId.value);

      if(selectedItem){
        let message = "";
        if(selectedItem.type == 4){
          message = "Document format is not supported by viewer. Do you want to download the file?"
        }else{
          message = "Do you want to download the file?"
        }
        let warning = {
          message: message,
          title: "File download.",
          confirmBtnText: "Ok",
          cancelBtnText: "Cancel",
          onConfirm: function(){ 
            debugger;
            if(selectedItem.downloadUrl){
              let elChild = document.createElement('a');
              elChild.setAttribute('id', 'downloadFileLink');
              elChild.setAttribute('href', selectedItem.downloadUrl);
              elChild.click();
              elChild.remove();      
            }
            return Promise.resolve();
          },
          onCancel: () => Promise.resolve()
        };
        window.readerControl.showWarningMessage(warning);
      }
    }
  }



  renderTreeViewItem = (value) => {
    if(value.type == 0){//Unexpected value
      return (<div id={value.id}><FontAwesomeIcon icon={faFileAlt} /> {value.text}</div>);//<Tooltip target={('#'+value.id)} visible={false} closeOnOutsideClick={false}><div>ExcelRemote IR</div></Tooltip>
    } else if(value.type == 1){//Folder
      return (<div id={value.id}><FontAwesomeIcon icon={faFolder} /> {value.text}</div>);//<Tooltip target={('#'+value.id)} visible={false} closeOnOutsideClick={false}><div>ExcelRemote IR</div></Tooltip>
    } else if(value.type == 2){//Viewable file (pdf or xod)
      debugger;
      if(this.settings.allowFilesDownload){
        return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFilePdf} /> {value.text}</span><span itemID={value.id} onClick={this.onDownloadClick} title='Download'>  <FontAwesomeIcon icon={faFileDownload}/></span></div>);
      }else{
        return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFilePdf} /> {value.text}</div>);
      }
      
    } else if(value.type == 3){//Non converted file
      return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFilePdf} /><span style={{color:"gray"}}> {value.text}</span></div>);
    } else if(value.type == 4){//File that can be downloaded (set icons for each of known extension)
      if(this.settings.allowFilesDownload){
        switch(value.extension){
          case 'doc':
          case 'docx': return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileWord} /> {value.text}</span><span itemID={value.id} onClick={this.onDownloadClick} title='Download'>  <FontAwesomeIcon icon={faFileDownload}/></span></div>);
          case 'xls':
          case 'xlsx': return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileExcel} /> {value.text}</span><span itemID={value.id} onClick={this.onDownloadClick} title='Download'>  <FontAwesomeIcon icon={faFileDownload}/></span></div>); 
          case 'tif':
          case 'tiff':
          case 'bmp':
          case 'jpg':
          case 'jpeg':
          case 'png': return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileImage} /> {value.text}</span><span itemID={value.id} onClick={this.onDownloadClick} title='Download'>  <FontAwesomeIcon icon={faFileDownload}/></span></div>);
          default : return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFile} /> {value.text}</span><span itemID={value.id} onClick={this.onDownloadClick} title='Download'>  <FontAwesomeIcon icon={faFileDownload}/></span></div>);         
        }
      }else{
        switch(value.extension){
          case 'doc':
          case 'docx': return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileWord} /> {value.text}</div>);
          case 'xls':
          case 'xlsx': return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileExcel} /> {value.text}</div>); 
          case 'tif':
          case 'tiff':
          case 'bmp':
          case 'jpg':
          case 'jpeg':
          case 'png': return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileImage} /> {value.text}</div>);
          default : return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFile} /> {value.text}</div>);         
        }
      }
      
    } else if(value.type == 5){//Document object
      return (<div><span id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFileAlt} /> {value.text}</span><a href={value.objectUrl} target='_blank' style={{marginLeft:'10px'}} title='Open object in new tab'><FontAwesomeIcon icon={faExternalLinkAlt} /></a></div>);
    } else if(value.type == 6){//Processing errors
      return (<div id={value.id} onClick={this.onSelectItem}><FontAwesomeIcon icon={faFile} /> {value.text}</div>);
    }
    else{
      return (<div>{value.text}</div>);      
    }
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
              id="documentsTree"
              items={this.settings.treeData}
              searchMode={this.settings.value}
              searchEnabled={true}
              itemRender={this.renderTreeViewItem}
        />
      </React.Fragment>
      </div>

    );
  }
}

const mapDispatchToProps = dispatch => ({
    dispatch,
});
  
const mapStateToProps = state => ({
    isDisabled: selectors.isElementDisabled(state, 'documentTreePanel')   });
  
export default connect(mapStateToProps, mapDispatchToProps)(DocumentTreePanel);