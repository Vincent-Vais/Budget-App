// BUDGET CONTROLLER
let budgetController = (function(){
    
})();

// UI CONTROLLER
let UIController = (function(){

})();

// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

    let ctrlAddItem = function(){
        // 1. Get field input data
        // 2. Add item to the budget controller
        // 3. Add a new item to UI
        // 4. Calculate the budget
        // 5. Display the budget
        console.log("ADD");
    }

    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (event) => {
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
    });

})(budgetController, UIController);