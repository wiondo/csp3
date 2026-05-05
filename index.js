/*
 * Name: 이현동
 * Date: 2026-05-05
 * Section: IAB 6068
 *
 * This is the JS file for my Food Diary web app.
 * It manages the weekly notebook pages and fetches recipe data from TheMealDB.
 */
"use strict";
(function() {
  const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
  let dayIdx = 0;

  const memoData = [
    { food: "", note: "" },
    { food: "", note: "" },
    { food: "", note: "" },
    { food: "", note: "" },
    { food: "", note: "" },
    { food: "", note: "" },
    { food: "", note: "" }
  ];

  window.addEventListener("load", initDiary);

  /**
   * Sets up page event listeners and draws the initial day page.
   * @returns {void}
   */
  function initDiary() {
    id("back-btn").addEventListener("click", prevDay);
    id("next-btn").addEventListener("click", nextDay);
    id("food-note").addEventListener("input", saveDay);
    id("diary-note").addEventListener("input", saveDay);
    id("search-btn").addEventListener("click", searchFood);
    id("food-search").addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        searchFood();
      }
    });

    drawDay();
  }

  /**
   * Saves the current day's memo values.
   * @returns {void}
   */
  function saveDay() {
    memoData[dayIdx].food = id("food-note").value;
    memoData[dayIdx].note = id("diary-note").value;
  }

  /**
   * Renders the current day title and saved memo values.
   * @returns {void}
   */
  function drawDay() {
    id("day-title").textContent = DAYS[dayIdx];
    id("food-note").value = memoData[dayIdx].food;
    id("diary-note").value = memoData[dayIdx].note;
  }

  /**
   * Moves to the next day page if possible.
   * @returns {void}
   */
  function nextDay() {
    saveDay();
    if (dayIdx < DAYS.length - 1) {
      dayIdx++;
      drawDay();
    }
  }

  /**
   * Moves to the previous day page if possible.
   * @returns {void}
   */
  function prevDay() {
    saveDay();
    if (dayIdx > 0) {
      dayIdx--;
      drawDay();
    }
  }

  /**
   * Searches recipe data using the current food search input.
   * @returns {Promise<void>}
   */
  async function searchFood() {
    let q = id("food-search").value.trim();

    if (q === "") {
      showErr("음식 이름을 입력하세요.");
      return;
    }

    showLoad();

    try {
      let d = await getMeal(q);
      showMeal(d);
    } catch (e) {
      showErr(e.message);
    }
  }

  /**
   * Fetches recipe data from TheMealDB by meal name.
   * @param {string} q - User search query.
   * @returns {Promise<object>} - Simplified meal data object.
   */
  async function getMeal(q) {
    let url = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + encodeURIComponent(q);
    let res = await fetch(url).then(checkStatus);
    let data = await res.json();

    if (!data.meals || data.meals.length === 0) {
      throw new Error("검색 결과가 없습니다.");
    }

    let m = data.meals[0];

    return {
      recipe: m.strInstructions ? m.strInstructions : "recipe 정보가 없습니다.",
      ingredient: getIng(m),
      national: m.strArea ? m.strArea : "정보 없음"
    };
  }

  /**
   * Extracts ingredient lines from TheMealDB response object.
   * @param {object} m - Raw meal object.
   * @returns {Array<string>} - Ingredient list.
   */
  function getIng(m) {
    let arr = [];

    for (let i = 1; i <= 20; i++) {
      let ing = m["strIngredient" + i];
      let mea = m["strMeasure" + i];

      if (ing && ing.trim() !== "") {
        if (mea && mea.trim() !== "") {
          arr.push(ing + " - " + mea);
        } else {
          arr.push(ing);
        }
      }
    }

    return arr;
  }

  /**
   * Displays fetched meal data in the result boxes.
   * @param {object} d - Simplified meal data.
   * @returns {void}
   */
  function showMeal(d) {
    id("recipe-box").textContent = d.recipe;
    renderIngredients(d.ingredient);
    id("national-box").textContent = d.national;
  }

  /**
   * Shows loading text in the result boxes.
   * @returns {void}
   */
  function showLoad() {
    id("recipe-box").textContent = "loading...";
    id("ingredient-box").textContent = "loading...";
    id("national-box").textContent = "loading...";
  }

  /**
   * Shows an error message inside the page.
   * @param {string} msg - Error message text.
   * @returns {void}
   */
  function showErr(msg) {
    id("recipe-box").textContent = msg;
    id("national-box").textContent = "-";

    let box = id("ingredient-box");
    clearBox(box);
    box.textContent = "-";
  }

  /**
   * Renders ingredients using DOM node creation.
   * @param {Array<string>} arr - Ingredient strings.
   * @returns {void}
   */
  function renderIngredients(arr) {
    let box = id("ingredient-box");
    clearBox(box);

    let ul = document.createElement("ul");

    for (let i = 0; i < arr.length; i++) {
      let li = document.createElement("li");
      li.textContent = arr[i];
      ul.appendChild(li);
    }

    box.appendChild(ul);
  }

  /**
   * Removes all children from a DOM element using removeChild.
   * @param {HTMLElement} el - Target element.
   * @returns {void}
   */
  function clearBox(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  /**
   * Throws an error when the fetch response is not ok.
   * @param {Response} response - Fetch response object.
   * @returns {Response} - Same response if valid.
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw new Error("데이터를 불러오지 못했습니다.");
    }
    return response;
  }

  /**
   * Returns the element with the given id.
   * @param {string} name - Element id.
   * @returns {HTMLElement} - Matching DOM element.
   */
  function id(name) {
    return document.getElementById(name);
  }
})();