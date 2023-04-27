const openFormBtn = document.getElementById("open-form-btn");
const closeFormBtn = document.getElementById("close-form-btn");
const modalWrap = document.querySelector(".modal-wrap");

openFormBtn.addEventListener("click", () => {
  modalWrap.style.display = "flex";
});

closeFormBtn.addEventListener("click", () => {
    modalWrap.style.display = "none";
    
});
  

const reviewForm=document.querySelector(".review-form");


const fullName=document.querySelector(".name");
const headline=document.querySelector(".headline");
const rating=document.querySelector(".rating");
const feedback=document.querySelector(".feedback");
const terms=document.querySelector(".terms");
const submit=document.querySelector(".submit-form");

//star function
function convertToStars(num) {
    console.log(num);
    const starPercentage = (num / 5) * 100;
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
    return `<div class="stars-outer"><div class="stars-inner" style="width:${starPercentageRounded}"></div></div>`;
  }
  


const modal=document.querySelector(".modal-wrap2");
const close=document.querySelector(".modal-wrap2 .modal-close");

submit.addEventListener("click", (e)=>{
    e.preventDefault();
    if (fullName.value && headline.value && rating.value && feedback.value && terms.checked) {
    db.collection('review-form').doc().set({
        fullName: fullName.value,
        headline: headline.value,
        rating: rating.value,
        feedback: feedback.value,
        
    }).then(()=>{
        reviewForm.reset();
        modal.classList.toggle("display-none");
        modalWrap.style.display = "none";       
      
    });
}else {
    alert("Please fill in all required fields.");
}
});

close.addEventListener("click", ()=>{
    modal.classList.toggle("display-none");
});



// Get the current sort order
let sortOrder = document.getElementById('sort-by');

sortOrder.addEventListener('change', (e) => {
    const selectedOption = e.target.value;
    //console.log(selectedOption);
    sortOrder=selectedOption;
    //console.log("sortby=", sortOrder);
    getReviews(selectedOption);
});
  
async function getAverageRating() {
    // Reference to the reviews collection in Firestore
    const reviewsRef = db.collection('review-form');
  
    // Get the reviews from Firestore
    const querySnapshot = await reviewsRef.get();
  
    // Calculate the total ratings and total reviews
    let totalRatings = 0;
    let totalReviews = 0;
    querySnapshot.forEach((doc) => {
      const review = doc.data();
      totalRatings += Number(review.rating);
      totalReviews++;
    });
  
    // Calculate the average rating
    const avgRating = (totalRatings / totalReviews).toFixed(1);
  
    // Return the average rating
    return avgRating;
}
  

// Get the reviews from Firestore and display them on the page
async function getReviews() {
    // Get the reviews container element
    const reviewsContainer = document.getElementById('reviews-container');
  
    // Clear the existing reviews from the container
    reviewsContainer.innerHTML = '';
  
    // Reference to the reviews collection in Firestore, sorted by rating
    let reviewsRef;
    if (sortOrder === 'rating-high-to-low') {
      reviewsRef = db.collection('review-form').orderBy('rating', 'desc');
    } else if (sortOrder === 'default') {
      reviewsRef = db.collection('review-form');
    } else {
      reviewsRef = db.collection('review-form').orderBy('rating', 'asc');
    }
  
    // Get the reviews from Firestore and display them on the page
    const querySnapshot = await reviewsRef.get();
    const totalReviews = querySnapshot.size;
  
    // Display the total number of reviews on the HTML page
    const totalReviewsElement = document.getElementById('total-reviews');
    totalReviewsElement.textContent = totalReviews;
  
    // Calculate the average rating
    const avgRating = await getAverageRating();
  
    // Display the average rating on the HTML page
    const avgRatingElement = document.getElementById('average-rating');
    avgRatingElement.textContent = avgRating;
  
    // Loop through the query snapshot and create HTML elements for each review
    querySnapshot.forEach((doc) => {
      const review = doc.data();
      const reviewElement = document.createElement('div');
      reviewElement.classList.add('review');
  
      reviewElement.innerHTML = `
        <p>User: ${review.fullName}</p>
        <p>Title: ${review.headline}</p>
        <p>Review: ${review.feedback}</p>
        <p>Rating: ${review.rating}</p>
      `;
      reviewsContainer.appendChild(reviewElement);
    });
}
  
  
  // Call the getReviews function when the page loads
  document.addEventListener('DOMContentLoaded', getReviews);
  



