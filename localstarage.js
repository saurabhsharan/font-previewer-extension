var localStarage = function() {
  var LSPREFIX = 'localstarage-';
  var STARCLASS = 'localstarage';
  var STARREDCLASS = 'starred';
  var CLONESUFFIX = '-clone';
  var EMPTYHTML = '(None yet)';

  var supportsStorage = function () {
    try {
      return !!localStorage.getItem;
    } catch (e) {
      return false;
    }
  }();

  var addClone = function(item, starredList, onClone) {
    if (starredList.innerHTML == EMPTYHTML) {
      starredList.innerHTML = '';
    }
    var starredNode = item.cloneNode(true);
    starredNode.id += CLONESUFFIX;
    starredList.appendChild(starredNode);
    // Events don't copy :(
    starredNode.querySelectorAll('.' + STARCLASS)[0].onclick = item.querySelectorAll('.' + STARCLASS)[0].onclick;
    onClone.call(null, starredNode);
  }

  var removeClone = function(item) {
    var starredNode = document.getElementById(item.id + CLONESUFFIX);
    starredNode.parentNode.removeChild(starredNode);
  }

  var checkEmpty = function(starredList) {
    if (starredList.querySelectorAll('.' + STARREDCLASS).length == 0) {
      starredList.innerHTML = EMPTYHTML;
    }
  }

  var addStar = function(item, options) {
    var lsKey = LSPREFIX + item.id;
    var star = document.createElement('span');
    star.className = STARCLASS;
    star.innerHTML = '★';
    star.onclick = function(event) {
      event.preventDefault();
      if (!star.classList.contains(STARREDCLASS)) {
        star.classList.add(STARREDCLASS);
        localStorage.setItem(lsKey, 'starred');
        if (options.starredList) {
          addClone(item, options.starredList, options.onClone);
        }
      } else {
        star.className = STARCLASS;
        localStorage.removeItem(lsKey);
        if (options.starredList) {
          removeClone(item);
          checkEmpty(options.starredList);
        }
      }
    };
    item.insertBefore(star, item.firstChild);

    if (localStorage.getItem(lsKey)) {
      star.classList.add(STARREDCLASS);
      if (options.starredList) {
        addClone(item, options.starredList, options.onClone);
      }
    }
  }

  return {

    init: function(list, options) {
      if (!supportsStorage) return false;
      var items = list.childNodes;
      for (var i = 0; i < items.length; i++) {
        if (items[i].nodeType == 1) {
          addStar(items[i], options);
        }
      }
      if (options.starredList) {
        checkEmpty(options.starredList);
      }
    },
    exportFavorites: function() {
      var favorites = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.startsWith(LSPREFIX)) {
          var fontId = key.substring(LSPREFIX.length);
          favorites.push(fontId);
        }
      }
      return favorites;
    },
    importFavorites: function(favorites, list, options) {
      if (!Array.isArray(favorites)) return;

      // Clear existing favorites in localStorage
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if (key && key.startsWith(LSPREFIX)) {
           localStorage.removeItem(key);
        }
      }

      // Clear Browse list stars in UI
      var existingStars = list.querySelectorAll('.' + STARREDCLASS);
      for(var i=0; i < existingStars.length; i++) {
          existingStars[i].classList.remove(STARREDCLASS);
      }

      // Clear Favorites list UI
      if (options.starredList) {
          options.starredList.innerHTML = '';
      }

      // Add new favorites
      for (var i = 0; i < favorites.length; i++) {
        var fontId = favorites[i];
        var lsKey = LSPREFIX + fontId;
        localStorage.setItem(lsKey, 'starred');
        
        var item = document.getElementById(fontId);
        if (item) {
           var star = item.querySelector('.' + STARCLASS);
           if (star) {
              star.classList.add(STARREDCLASS);
           }
           if (options.starredList) {
              addClone(item, options.starredList, options.onClone);
           }
        }
      }
      if (options.starredList) {
          checkEmpty(options.starredList);
      }
    }
  }
}();