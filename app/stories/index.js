/*eslint arrow-body-style: [0]*/
/*eslint no-multi-spaces: [0]*/
/*eslint-env es6*/
import React from 'react';
import {storiesOf, action, linkTo} from '@kadira/storybook';
import '../styles/main.scss';
import '../../node_modules/normalize.css/normalize.css';
import '../../node_modules/please-wait/build/please-wait.css';
import '../../node_modules/react-select/dist/react-select.css';
import '../../node_modules/react-joyride/lib/styles/react-joyride-compiled.css';
import '../../node_modules/draft-js/dist/Draft.css';
import '../styles/components/edit-param-group.scss';
import '../styles/components/input-group.scss';
import '../styles/components/fonts-collection.scss';
import '../styles/components/warning-message.scss';
import '../styles/components/replay-playlist.scss';
import '../styles/components/create-param-group.scss';
import '../styles/components/export-as.scss';
import '../styles/components/nps-message.scss';
import '../styles/components/top-bar-menu.scss';
import '../styles/components/side-tabs.scss';
import '../styles/components/search-glyph-list.scss';
import '../styles/components/account.scss';
import '../styles/components/checkbox-with-img.scss';
import '../styles/components/forgotten-password.scss';
import '../styles/components/prototypo-canvas.scss';
import '../styles/components/glyph-list.scss';
import '../styles/components/cards-widget.scss';
import '../styles/components/prototypo-text.scss';
import '../styles/components/sliders.scss';
import '../styles/components/variant.scss';
import '../styles/components/alternate-menu.scss';
import '../styles/components/hover-view-menu.scss';
import '../styles/components/not-a-browser.scss';
import '../styles/components/onboarding.scss';
import '../styles/components/action-bar.scss';
import '../styles/components/glyph-btn.scss';
import '../styles/components/delete-param-group.scss';
import '../styles/components/prototypo-word.scss';
import '../styles/components/individualize-button.scss';
import '../styles/components/canvas-glyph-input.scss';
import '../styles/components/news-feed.scss';
import '../styles/components/close-button.scss';
import '../styles/components/progress-bar.scss';
import '../styles/components/contextual-menu.scss';
import '../styles/components/wait-for-load.scss';
import '../styles/components/zoom-buttons.scss';
import '../styles/components/controls-tabs.scss';
import '../styles/components/tutorials.scss';
import '../styles/components/go-pro-modal.scss';
import '../styles/components/handlegrip-text.scss';
import '../styles/components/account/account-app.scss';
import '../styles/components/account/account-profile.scss';
import '../styles/components/account/account-change-password.scss';
import '../styles/components/account/account-billing-address.scss';
import '../styles/components/account/account-add-card.scss';
import '../styles/components/account/account-subscription.scss';
import '../styles/components/account/account-change-plan.scss';
import '../styles/components/account/account-invoice-list.scss';
import '../styles/components/account/credits-export.scss';
import '../styles/components/subscription/subscription.scss';
import '../styles/components/subscription/subscription-sidebar.scss';
import '../styles/components/subscription/subscription-choose-plan.scss';
import '../styles/components/shared/input-with-label.scss';
import '../styles/components/shared/display-with-label.scss';
import '../styles/components/shared/columns.scss';
import '../styles/components/shared/billing-address.scss';
import '../styles/components/shared/account-validation-button.scss';
import '../styles/components/shared/form-error.scss';
import '../styles/components/shared/form-success.scss';
import '../styles/components/shared/select-override.scss';
import '../styles/components/shared/invoice.scss';
import '../styles/components/shared/loading-overlay.scss';
import '../styles/components/shared/button.scss';
import '../styles/components/shared/modal.scss';
import '../styles/components/shared/action-form-buttons.scss';
import '../styles/components/toolbar/toolbar.scss';
import '../styles/components/toolbar/arianne-thread.scss';
import '../styles/components/toolbar/view-buttons.scss';
import '../styles/components/topbar/allowed-top-bar-with-payment.scss';
import '../styles/components/collection/collection.scss';
import '../styles/components/collection/family.scss';
import '../styles/components/viewPanels/view-panels-menu.scss';
import '../styles/components/views/prototypo-word-input.scss';
import '../styles/components/indivMode/indiv-group-list.scss';
import '../styles/components/indivMode/indiv-sidebar.scss';
import '../styles/components/canvasTools/canvas-bar.scss';
import '../styles/lib/spinners/3-wave.scss';
import '../styles/lib/spinkit.scss';
import '../styles/lib/_variables.scss';
import '../styles/layout.scss';
import '../styles/userAdmin.scss';
import '../styles/tracking.scss';
import '../styles/layout/topbar.scss';
import '../styles/layout/dashboard.scss';
import '../styles/layout/signin.scss';
import '../styles/layout/glyph-panel.scss';
import '../styles/layout/replay.scss';
import '../styles/layout/prototypopanel.scss';
import '../styles/layout/workboard.scss';
import '../styles/layout/sidebar.scss';
import '../styles/main.scss';
import '../styles/_variables.scss';
// Welcome

import Welcome from './Welcome';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

// Sliders
// TODO: Get these stories running, for now they are linked to too many things to run, like an hoodie config
/*
import Slider from '../scripts/components/sliders.components.jsx';
import RadioSlider from '../scripts/components/sliders.components.jsx';

storiesOf('Sliders', module)
	.add('Single slider', () => (
	  <Slider
		  demo={true}
		  disabled={false}
		  init={0} max={20}
		  maxAdvised={0}
		  min={-10}
		  minAdvised={-5}
		  name={'Single slider'}
		/>
	))
	.add('Radio slider', () => (
	  <RadioSlider
		  demo={true}
		  disabled={false}
		  init={0} max={20}
		  maxAdvised={0}
		  min={-10}
		  minAdvised={-5}
		  name={'Radio slider'}
		/>
	));
*/
//Close button
import CloseButton from '../scripts/components/close-button.components.jsx';
storiesOf('Close button', module)
	.add('Simple button', () => (
		<CloseButton click={() => (true)}/>
	));

//Glyph list

import Glyph from '../scripts/components/glyph.components.jsx';
import GlyphList from '../scripts/components/glyph-list.components.jsx';
storiesOf('Glyph list', module)
	.add('Single glyph', () => (
		<Glyph
			key={65}
			glyph={[{name: "A_cap"}]}
			selected={false}
			unicode={65}
		/>
	))
	.add('Single glyph with manual changes', () => (
		<Glyph
			key={65}
			glyph={[{name: "A_cap"}]}
			manualEdited={true}
			selected={false}
			unicode={65}
		/>
	))
	.add('Single glyph with alternates', () => (
		<Glyph
			key={82}
			glyph={[{name: "R_cap"}, {altImg: "alt-R.svg", name: "R_cap_alt"}]}
			selected={false}
			unicode={82}
		/>
	))
	.add('Single glyph with alternates and manual changes', () => (
		<Glyph
			key={82}
			glyph={[{name: "R_cap"}, {altImg: "alt-R.svg", name: "R_cap_alt"}]}
			selected={false}
			unicode={82}
			manualEdited={true}
		/>
	))
	.add('Glyph list', () => (
		<GlyphList
			pinned={[]}
			savedSearch
			selected="82"
			selectedTag="uppercase"
			tags={['all', 'latin', 'uppercase']}
			glyphs={{
				'65': [{name: "A_cap"}],
				'82': [{name: "R_cap"}, {altImg: "alt-R.svg", name: "R_cap_alt"}],
			}}
		/>
	));

//Go pro modal
/*
import GoProModal from '../scripts/components/go-pro-modal.components.jsx';
storiesOf('Go pro modal', module)
	.add('Modal', () => (
		<GoProModal/>
	));
*/
/* ---------- CANVAS --------- */
import ZoomButtons from '../scripts/components/zoom-buttons.components.jsx';
import CanvasBar from '../scripts/components/canvasTools/canvas-bar.components.jsx';
import CanvasBarButton from '../scripts/components/canvasTools/canvas-bar-button.components.jsx';
storiesOf('Canvas', module)
	//Canvas bar
	.add('Canvas bar button', () => (
		<CanvasBarButton key="move" name="move" active={false} click={() => (true)}/>
	))
	.add('Canvas bar with buttons', () => (
		<CanvasBar/>
	))
	//Zoom buttons
	.add('Zoom buttons', () => (
		<ZoomButtons plus={() => (true)} minus={() => (true)}/>
	));
