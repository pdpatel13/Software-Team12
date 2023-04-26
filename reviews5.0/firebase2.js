const firebaseConfig = {
    apiKey: "AIzaSyBMnEJHcgz0XBpWWq-GHg6Vea38ULrrKKU",
    authDomain: "bestestbuy-7b81c.firebaseapp.com",
    databaseURL: "https://bestestbuy-7b81c-default-rtdb.firebaseio.com",
    projectId: "bestestbuy-7b81c",
    storageBucket: "bestestbuy-7b81c.appspot.com",
    messagingSenderId: "811419927323",
    appId: "1:811419927323:web:1cda157e4069c7c092c9be",
    measurementId: "G-12ZLT4GR17"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //const analytics = getAnalytics(app)
  const db=firebase.firestore();

  