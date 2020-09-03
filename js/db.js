// offline data
db.enablePersistence().catch((err) => {
  if (err.code == 'failed-precondition') {
    // mutiple tabs open once
    console.log('persistence failed');
  } else if (err.code == 'unimplemented') {
    // lack of browser support
    console.log('persistence is not available');
  }
});

// real time listener

db.collection('recipes').onSnapshot((snapshot) => {
  // console.log(snapshot.docChanges())
  snapshot.docChanges().forEach((change) => {
    // console.log(change, change.doc.data());
    if (change.type === 'added') {
      renderRecipe(change.doc.data(), change.doc.id);
      console.log(change.doc.data());
    }
    if (change.type === 'removed') {
      removeRecipe(change.doc.id);
    }
  });
});

// add new recipe
const form = document.querySelector('form');
form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value,
  };

  db.collection('recipes')
    .add(recipe)
    .catch((err) => console.log(err));

  form.title.value = '';
  form.ingredients.value = '';
});

// delete a recipe
const recipeContainer = document.querySelector('.recipes');

recipeContainer.addEventListener('click', (e) => {
  if (e.target.tagName === 'I') {
    const id = e.target.getAttribute('data-id');
    db.collection('recipes').doc(id).delete();
  }
});
