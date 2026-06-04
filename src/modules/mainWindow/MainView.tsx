import React from 'react';
import CognitiveConsole from './CognitiveConsole';
import DeveloperPanel from '../devPanel';

const MainView: React.FC = () => {
  return (
    <>
      <CognitiveConsole />
      <DeveloperPanel />
    </>
  );
};

export default MainView;
