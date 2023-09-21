import * as React from 'react';
import '../../css/chat/tab.css';
import Search from '../../components/Search';
import Main from '../../components/Main';
import MessageUser from './MessageUser';

const TabsTest = () => {

  const [currentTab, setCurrentTab] = React.useState('1');
  const tabs = [
      {
          id: 1,
          tabTitle: 'Direct Messages',
          content: <>
          <Search name="tabDesign"/>
          <MessageUser profile='/assets/het-tale.jpg' name="Hasnaa" message="hello"/>
          </>
      },
      {
          id: 2,
          tabTitle: 'Channels',
          content: 'Hello channels'
      }
  ];

  const handleTabClick = (e :any) => {
      setCurrentTab(e.target.id);
  }

  return (
      <div className='container'>
          <div className='tabs'>
              {tabs.map((tab, i) =>
                  <button key={i} id={tab.id.toString()} disabled={currentTab === `${tab.id}`} onClick={(handleTabClick)}>{tab.tabTitle}</button>
              )}
          </div>
          <div className='content'>
              {tabs.map((tab, i) =>
                  <div key={i}>
                      {currentTab === `${tab.id}` && <div>{tab.content}</div>}
                  </div>
              )}
          </div>
      </div>
  );
}

export default TabsTest;