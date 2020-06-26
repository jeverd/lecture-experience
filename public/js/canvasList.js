/* eslint-disable no-undef */
export default function makeBoardView() {
  const modal = document.getElementById('myModal');
  // const modalImage = document.getElementById('modal-image');
  // const elementsArray = document.querySelectorAll('.canvas-image-preview');
  const leftImagesToggleArrow = document.getElementById('canvas-toggle-left');
  const rightImagesToggleArrow = document.getElementById('canvas-toggle-right');
  const imageDisplay1 = document.getElementById('img-display-1');
  const imageDisplay2 = document.getElementById('img-display-2');

  // for each canvas, get the source and push into array
  const listOfImageSrc = [];
  document.querySelectorAll('[data-page=page]').forEach((elem) => {
    if (elem.style.display !== 'none') {
      listOfImageSrc.push($(elem).find('img')[0].src);
    }
  });

  // set indices of image(s) to be display from the array to the user
  let currentImage1 = 0;
  let currentImage2 = 1;

  // initialize images initially shown to user
  imageDisplay1.src = listOfImageSrc[currentImage1];
  imageDisplay2.src = listOfImageSrc[currentImage2];

  // let selectedImage = null;

  // When display image is selected, the modal is opened and the selected image is displayed
  // elementsArray.forEach((elem) => {
  //   elem.addEventListener('click', (e) => {
  //     modal.style.display = 'block';
  //     if (e.target.tagName === 'IMG') {
  //       selectedImage = e.target.getAttribute('src');
  //       modalImage.src = selectedImage;
  //     }
  //   });
  // });

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName('close')[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = () => {
    modal.style.display = 'none';
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // we want the user to be able to browse through their images on if they have more than 2
  if (listOfImageSrc.length > 2) {
    // show the toggle arrows
    leftImagesToggleArrow.style.display = 'block';
    rightImagesToggleArrow.style.display = 'block';

    // on left arrow click
    leftImagesToggleArrow.addEventListener('click', () => {
      // set index counters
      const nextIndex1 = currentImage1 + 2;
      const nextIndex2 = currentImage2 + 2;

      // make sure the first index (right image) doesnt exceed the number of available images
      if (listOfImageSrc.length - nextIndex1 > 0) {
        currentImage1 = nextIndex1;
        imageDisplay1.src = listOfImageSrc[currentImage1];
      } else {
        currentImage1 = nextIndex1;
      }

      // make sure the second index (left image) doesnt exceed the number of available images
      if (listOfImageSrc.length - nextIndex2 > 0) {
        currentImage2 = nextIndex2;
        imageDisplay2.src = listOfImageSrc[currentImage2];
      } else {
        currentImage2 = nextIndex2;
        imageDisplay2.src = null;
      }

      if (
        nextIndex1 === listOfImageSrc.length - 2
        && nextIndex2 === listOfImageSrc.length - 1
      ) {
        leftImagesToggleArrow.style.display = 'none';
      } else if (nextIndex1 === listOfImageSrc.length - 1) {
        leftImagesToggleArrow.style.display = 'none';

        // temporary solution to hide image
        imageDisplay2.style.display = 'none';
      }

      if (nextIndex1 > 0 || nextIndex2 > 0) {
        rightImagesToggleArrow.style.display = 'block';
      }
    });

    // current issue(s) image lagging vehind on odd number of images
    // hide arrows based on number of images length

    rightImagesToggleArrow.addEventListener('click', () => {
      // temporary solution to show image
      if (imageDisplay2.style.display === 'none') {
        imageDisplay2.style.display = 'block';
      }

      // set index counters
      const nextIndex1 = currentImage1 - 2;
      const nextIndex2 = currentImage2 - 2;

      // make sure the first index (right image) doesnt descend the number of available images
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
        nextIndex2 !== listOfImageSrc.length - 1
        || nextIndex1 !== listOfImageSrc.length - 1
      ) {
        leftImagesToggleArrow.style.display = 'block';
      }

      if (nextIndex2 === 0 || nextIndex1 === 0) {
        rightImagesToggleArrow.style.display = 'none';
      }
    });
  }
}
