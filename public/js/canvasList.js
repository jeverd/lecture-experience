var modal = document.getElementById('myModal');
let modalImage = document.getElementById('modal-image');
let elementsArray = document.querySelectorAll('.canvas-image-preview');
let leftImagesToggleArrow = document.getElementById('canvas-toggle-left');
let rightImagesToggleArrow = document.getElementById('canvas-toggle-right');
let imageDisplay1 = document.getElementById('img-display-1');
let imageDisplay2 = document.getElementById('img-display-2');

//for each canvas, get the source and push into array
var listOfImageSrc = [];
let pageList = document.querySelectorAll('[data-page]').forEach((elem) => {
  listOfImageSrc.push($(elem).find('img')[0].src);
});

//set indices of image(s) to be display from the array to the user
var currentImage1 = 0;
var currentImage2 = 1;

//initialize images initially shown to user
imageDisplay1.src = listOfImageSrc[currentImage1];
imageDisplay2.src = listOfImageSrc[currentImage2];

var selectedImage = null;

//When display image is selected, the modal is opened and the selected image is displayed
elementsArray.forEach(function (elem) {
  elem.addEventListener('click', (e) => {
    modal.style.display = 'block';
    if (e.target.tagName == 'IMG') {
      selectedImage = e.target.getAttribute('src');
      modalImage.src = selectedImage;
    }
  });
});

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

//we want the user to be able to browse through their images on if they have more than 2
if (listOfImageSrc.length > 2) {
  //show the toggle arrows
  leftImagesToggleArrow.style.display = 'block';
  rightImagesToggleArrow.style.display = 'block';

  //on left arrow click
  leftImagesToggleArrow.addEventListener('click', () => {
    //set index counters
    var nextIndex1 = currentImage1 + 2;
    var nextIndex2 = currentImage2 + 2;

    //make sure the first index (right image) doesnt exceed the number of available images
    if (listOfImageSrc.length - nextIndex1 > 0) {
      currentImage1 = nextIndex1;
      imageDisplay1.src = listOfImageSrc[currentImage1];
    } else {
      currentImage1 = nextIndex1;
    }

    //make sure the second index (left image) doesnt exceed the number of available images
    if (listOfImageSrc.length - nextIndex2 > 0) {
      currentImage2 = nextIndex2;
      imageDisplay2.src = listOfImageSrc[currentImage2];
    } else {
      currentImage2 = nextIndex2;
      imageDisplay2.src = null;
    }

    if (
      nextIndex1 === listOfImageSrc.length - 2 &&
      nextIndex2 === listOfImageSrc.length - 1
    ) {
      leftImagesToggleArrow.style.display = 'none';
    } else if (nextIndex1 === listOfImageSrc.length - 1) {
      leftImagesToggleArrow.style.display = 'none';

      //temporary solution to hide image
      imageDisplay2.style.display = 'none';
    }

    if (nextIndex1 > 0 || nextIndex2 > 0) {
      rightImagesToggleArrow.style.display = 'block';
    }
  });

  //current issue(s) image lagging vehind on odd number of images
  //hide arrows based on number of images length

  rightImagesToggleArrow.addEventListener('click', () => {
    //temporary solution to show image
    if (imageDisplay2.style.display == 'none') {
      imageDisplay2.style.display = 'block';
    }

    //set index counters
    var nextIndex1 = currentImage1 - 2;
    var nextIndex2 = currentImage2 - 2;

    //make sure the first index (right image) doesnt descend the number of available images
    if (nextIndex1 > -1) {
      currentImage1 = nextIndex1;
      imageDisplay1.src = listOfImageSrc[currentImage1];
      imageDisplay1.style.display = 'block';
    }

    if (nextIndex2 > 0) {
      currentImage2 = nextIndex2;
      imageDisplay2.src = listOfImageSrc[currentImage2];
      imageDisplay2.style.display = 'block';
    }

    if (
      nextIndex2 !== listOfImageSrc.length - 1 ||
      nextIndex1 !== listOfImageSrc.length - 1
    ) {
      leftImagesToggleArrow.style.display = 'block';
    }

    if (nextIndex2 === 0 || nextIndex1 === 0) {
      rightImagesToggleArrow.style.display = 'none';
    }
  });
}
