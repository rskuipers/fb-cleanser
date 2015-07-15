var settings = {"enabled": false};
var messageNamespace = 'fbcleanser';

chrome.storage.local.get(function(storageSettings) {
    settings = storageSettings;

    if (settings.enabled) {
        enable();
    } else {
        disable();
    }
});

chrome.runtime.sendMessage({
    from: messageNamespace,
    subject: 'showPageAction'
});

chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.from === messageNamespace && msg.subject === 'toggle') {
        if (settings.enabled) {
            disable();
        } else {
            enable();
        }
    }
});

var enable = function() {
    settings.enabled = true;
    chrome.storage.local.set(settings);
    hideCrap();

    chrome.runtime.sendMessage({
        from: messageNamespace,
        subject: 'enabledPageAction'
    });
};

var disable = function() {
    settings.enabled = false;
    chrome.storage.local.set(settings);
    showCrap();

    chrome.runtime.sendMessage({
        from: messageNamespace,
        subject: 'disabledPageAction'
    });
};

var storyToggle = function() {
    if (story.classList.contains('fb-cleanser-expanded')) {
        story.classList.remove('fb-cleanser-expanded');
        story.classList.add('fb-cleanser-collapsed');
    } else {
        story.classList.remove('fb-cleanser-collapsed');
        story.classList.add('fb-cleanser-expanded');
    }
};

var getStory = function(elem) {
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.id.indexOf('hyperfeed_story') > -1) {
            return elem;
        }
    }
};

var getCrap = function() {
    var crap = [];
    var titles = document.querySelectorAll('[id^=hyperfeed_story] h5');

    for (var i = 0; i < titles.length; i++) {
        var title = titles[i];

        if (!/((liked|commented on) this|shared)/.test(title.innerText)) {
            continue;
        }

        crap.push({story: getStory(title), title: title});
    }

    return crap;
};

var hideCrap = function() {
    var crap = getCrap();
    crap.forEach(function(item) {
        item.title.removeEventListener('click', storyToggle);
        item.title.addEventListener('click', storyToggle);

        if (!item.story.classList.contains('fb-cleanser-expanded')) {
            if (item.title.innerText.indexOf('shared') > -1) {
                item.story.classList.add('fb-cleanser-share');
            }
            item.story.classList.add('fb-cleanser-collapsed');
        }
    });
};

var showCrap = function() {
    var crap = getCrap();
    crap.forEach(function(item) {
        item.title.removeEventListener('click', storyToggle);
        item.story.classList.remove('fb-cleanser-expanded');
        item.story.classList.remove('fb-cleanser-collapsed');
    });
};

var init = function() {
    var observer = new MutationObserver(function (mutations) {
        if (!settings.enabled) {
            return;
        }
        mutations.forEach(hideCrap);
    });

    observer.observe(document.querySelector('#contentCol'), {
        childList: true,
        subtree: true
    });
};

init();
