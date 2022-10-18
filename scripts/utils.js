const profileIsValid = () => {
    const value = localStorage.getItem('ProfileIsValid');
    if (value) {
        return true;
    }

    const fullName = document.querySelector('#form-user-fullName').value;
    const nickname = document.querySelector('#form-user-nickName').value;
    const email = document.querySelector('#form-user-email').value;

    if (fullName && email && nickname) {
        return true;
    }

    return false;
};

const performUserFormValidation = () => {
    if (profileIsValid()) {
        document.querySelector('#createProfileButton').removeAttribute('disabled');
    } else {
        document
            .querySelector('#createProfileButton')
            .setAttribute('disabled', 'disabled');
    }
};

const showAllTabs = () => {
    //document.querySelector('#ama-nav-tab').style.display = 'block';
    document.querySelector('#timeline-nav-tab').style.display = 'block';
    document.querySelector('#leaderboard-nav-tab').style.display = 'block';
    document.getElementById('profile-nav-tab').style.display = 'none';
    // document.querySelector('#ama-tab').click();
    console.log(document.getElementById('widget'));
    document.querySelector('#widget-tab').click();
};

const updateUserProfile = ({ fullName, email, nickname }) => {
    LiveLike.updateUserProfile({
        accessToken: LiveLike.userProfile.access_token,
        options: {
            nickname: nickname,
            custom_data: JSON.stringify({
                fullName: fullName,
                email: email,
            }),
        },
    })
        .then((res) => {
            localStorage.setItem('ProfileIsValid', true);
            refreshProfileData();
            showAllTabs();
            document.getElementById("player").style.display = "grid";
        })
        .catch((err) => {
            console.warn(err);
        });
};

const refreshProfileData = () => {
    document.querySelector('#form-user-nickName').value =
        LiveLike.userProfile.nickname;
    var customData = JSON.parse(LiveLike.userProfile.custom_data);
    if (customData) {
        if (customData.fullName) {
            document.querySelector('#form-user-fullName').value = customData.fullName;
        }
        if (customData.email) {
            document.querySelector('#form-user-email').value = customData.email;
        }
    }
    performUserFormValidation();
};

const handleCreateUserProfile = (e) => {
    if (profileIsValid()) {
        updateUserProfile({
            fullName: document.querySelector('#form-user-fullName').value,
            email: document.querySelector('#form-user-email').value,
            nickname: document.querySelector('#form-user-nickName').value,
        });
    }
};

const showProfileTab = () => {
    //document.querySelector('#ama-nav-tab').style.display = 'none';
    document.querySelector('#timeline-nav-tab').style.display = 'none';
    document.querySelector('#leaderboard-nav-tab').style.display = 'none';
    document.getElementById('profile-tab-label').click();
};

const showProfileTabIfFirstTimeVisiting = () => {
    performUserFormValidation();
    if (!profileIsValid()) {
        showProfileTab();
    } else {
        document.getElementById("player").style.display = "grid";
        document.getElementById('profile-nav-tab').style.display = 'none';
        document.getElementById('widget-tab').click();
    }
};