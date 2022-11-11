document.addEventListener("DOMContentLoaded", function () {
  var tabList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tab"]'));
  tabList.forEach(function (tab) {
    tab.addEventListener("shown.bs.tab", function (e) {
      const dot = e.target.getElementsByClassName('dot')[0];
      if (dot) {
        dot.classList.add('hidden');
      }
    });
  });
});

function handleWidgetsScrolling(widgetsContainer) {
  const widgetsTabPane = document.querySelector('.widgets-tab.tab-pane')
  const scrollUp = () => {
    widgetsTabPane.scrollTop = 0;
  }
  widgetsContainer.addEventListener('widgetattached', scrollUp);
}

const init = (clientId, programId, leaderboardId) => {
  LiveLike.init({
    clientId: clientId
  }).then(() => {

    LiveLike.applyLocalization({
      en: {
        "widget.quiz.voteButton.label": "Valider",
        "widget.quiz.votedText": "Fait!",
        'widget.textAsk.placeholder': 'Écrivez ici...',
        'widget.textAsk.sendButton.label': 'ENVOYER',
      },
      fr: {
        "widget.quiz.voteButton.label": "Valider",
        "widget.quiz.votedText": "Fait!",
        'widget.textAsk.placeholder': 'Écrivez ici...',
    'widget.textAsk.sendButton.label': 'ENVOYER',
      }
    })

    setupLeaderboard(leaderboardId);
    showProfileTabIfFirstTimeVisiting();
    refreshProfileData()
    const widgetsContainer = document.querySelector('livelike-widgets');
    widgetsContainer.programid = programId;
    //addAMAWidgetFilter(widgetsContainer);
    handleWidgetsScrolling(widgetsContainer);
    //const chatContainer = document.querySelector('livelike-chat');
    //chatContainer.roomId = roomId;
    addEventListenerForQuizWidgetAnswers();
  });
};

const addEventListenerForQuizWidgetAnswers = () => {
  widget.addEventListener('answer', handleResultAnimation);
};

const handleResultAnimation = e => {
  const { result, element, widget, answer } = e.detail;
  console.log(e.target.lastChild.lastChild.children[1]);
  let rewardText = "";
  if (answer.is_correct) {
    rewardText = `${answer.rewards[0].reward_item_amount} ${answer.rewards[0].reward_item_name}!`
  }
  const rewardElement = `<span class="confirmation-message quiz-confirmation-message"> ${rewardText}</span>`;

  e.target.lastChild.lastChild.children[1].insertAdjacentHTML('beforeend', rewardElement);

  const animationEl = element.querySelector('.animation-container');
  if (result !== 'unattempted' && !animationEl) {
    let imgUrl = answer.is_correct ? './images/correct.gif' : './images/incorrect.gif';

    const elStr =
      `<div class="animation-container" style="position: absolute; z-index: 10; left: 50%; width: 100%; top: 50%; transform: translate(-50%,-50%); z-index: 1000; width: 100%;">
        <img class="animation-image" style="height: 100%; width: 100%;" src="${imgUrl}" alt="Result animation">
</div>`;

    const widgetEl = element.querySelector('livelike-widget-root');
    widgetEl && widgetEl.insertAdjacentHTML(
      'beforeend',
      elStr
    );
    widgetEl && setTimeout(() => {
      const animation = element.querySelector('.animation-image');
      const gif = element.querySelector('.animation-container');
      if (gif && animation) {
        animation.src = "";
        gif.removeChild(animation);
      }
    }, 2250);
  }

};


function addAMAWidgetFilter(widgets) {
  //For filtering old widgets (received from timeline resource)
  let filterAlertWidgets = ({ widgets }) => widgets.filter(widget => widget.kind !== 'text-ask');
  widgets && (widgets.onInitialWidgetsLoaded = filterAlertWidgets);
  widgets && (widgets.onMoreWidgetsLoaded = filterAlertWidgets);

  //For filtering new widgets (received from CMS via pubnub)
  let filterNewAlertWidgets = (widgetPayload) => widgetPayload.kind !== 'text-ask' && widgetPayload;
  widgets && (widgets.onWidgetReceived = filterNewAlertWidgets);
};

function addListenersForDot(programId) {
  LiveLike.addWidgetListener(
    { programId: programId },
    (e) => {
      //New Message
      //Check if active tab is not chat then remove hidden from dot class
      let activTab = document.getElementsByClassName("nav-link active")['widget-tab']
      if (activTab === undefined) {
        document.querySelector('#widget-tab > img').classList.remove('hidden')
      }
    }
  );

  //const callback = (data) => {
  //  let activTab = document.getElementsByClassName("nav-link active")['ama-tab']
  //  if(activTab === undefined) {
  //      document.querySelector('#ama-tab > img').classList.remove('hidden')
  //  }
  //}
  //
  //LiveLike.addMessageListener({roomId: roomId}, callback);
}

const setupLeaderboard = (leaderboardId) => {
  const buildProfileRank = (leaderboardId) => {
    return LiveLike.getLeaderboardProfileRank({
      leaderboardId,
      profileId: LiveLike.userProfile.id,
    })
      .then((profileRank) => {
        // If rank and points element already exist, update their values
        //const ptsEl = document.querySelector('#user-profile-points');
        //ptsEl.innerHTML = `${profileRank.score} Pts.`;
      })
      .catch(() => console.log('Current user not a part of leaderboard yet.'));
  };

  const buildLeaderboard = (leaderboardId) => {
    LiveLike.getLeaderboardEntries({
      leaderboardId,
    }).then((lb) => {
      const lbContainer = document.querySelector(
        '.leaderboard-entries-container'
      );

      // If leaderboard items already exist, remove them to re-build on leaderboard update
      lbContainer.children.length > 0 &&
        Array.from(lbContainer.children).forEach((el) => el.remove());

      // // Get current profile results
      // const currentProfileEntry = lb.entries.find(
      //   (x) => x.profile_id == LiveLike.userProfile.id
      // );
      // if (currentProfileEntry) {
      //   if (currentProfileEntry.rank >= 10) {
      //     lb.entries.unshift(currentProfileEntry);
      //   }
      // } else {
      //   lb.entries.unshift({
      //     profile_id: LiveLike.userProfile.id,
      //     rank: '',
      //     score: 0,
      //   });
      // }

      // Loop through leaderboard entries to create list items for each entry
      // lb.entries = lb.entries.slice(0, 10);
      lb.entries.forEach((entry) => {
        const entryRow = document.createElement('tr');
        entryRow.setAttribute('class', 'list-item');
        if (entry.profile_id === LiveLike.userProfile.id) {
          entry.profile_nickname = entry.profile_nickname + '(moi)';
          entryRow.setAttribute('class', 'list-item current-profile-list-item');
        }

        if (entry.rank <= 3) {
          entryRow.innerHTML = `
          <td class="score-label rank active-bage">${entry.rank}</td>
          <td class="score-label name">${entry.profile_nickname}</td>
          <td class="score-label pts">${entry.score}</td>`;

        } else {
          entryRow.innerHTML = `
<td class="score-label rank">${entry.rank}</td>
<td class="score-label name">${entry.profile_nickname}</td>
<td class="score-label pts">${entry.score}</td>`;
        }

        lbContainer.appendChild(entryRow);
      });
    });
  };


  const updateLeaderboardData = () => {
    buildLeaderboard(leaderboardId);
    buildProfileRank(leaderboardId);
  };
  if (leaderboardId) {
    // When a widget is dismissed, we update the leaderboard to show updated ranks and points
    const evts = ['vote', 'answer', 'prediction', 'cheer', 'slider', 'beforewidgetdetached'];
    evts.forEach(evt => document.addEventListener(evt, updateLeaderboardData));

    document.addEventListener('rankchange', (data) => {
      updateLeaderboardData();
      if (data.detail.rewards.length) {
        //const ptsEl = document.querySelector('#user-profile-points');
        //ptsEl.classList.add('bounce');
        //setTimeout(() => ptsEl.classList.remove('bounce'), 1200);
      }
    });
  }
  updateLeaderboardData();
};
