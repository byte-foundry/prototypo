import { configure } from '@kadira/storybook';

function loadStories() {
  require('../app/stories');
}

configure(loadStories, module);
