document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function renderParticipants(participants, activityName) {
    if (!participants.length) {
      return '<p class="participants-empty">No students have signed up yet.</p>';
    }

    return `
      <ul class="participants-list">
        ${participants
          .map(
            (participant) => `
              <li class="participant-item">
                <span>${participant}</span>
                <button
                  type="button"
                  class="unregister-btn"
                  data-activity="${activityName}"
                  data-email="${participant}"
                  aria-label="Unregister ${participant}"
                  title="Unregister ${participant}"
                >
                  ✕
                </button>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    if (!activities || Object.keys(activities).length === 0) {
      activitiesList.innerHTML = "<p>No activities available right now.</p>";
      return;
    }

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;

      activityCard.innerHTML = `
        <div class="activity-card-header">
          <div>
            <h4>${name}</h4>
            <p>${details.description}</p>
          </div>
          <span class="availability-badge">${spotsLeft} spots left</span>
        </div>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <div class="participants-section">
          <p class="participants-title"><strong>Signed up students</strong></p>
          ${renderParticipants(details.participants, name)}
        </div>
      `;

      activitiesList.appendChild(activityCard);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        showMessage(result.detail || "Unable to unregister right now.", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const unregisterButton = event.target.closest(".unregister-btn");

    if (!unregisterButton) {
      return;
    }

    const activityName = unregisterButton.dataset.activity;
    const email = unregisterButton.dataset.email;

    await unregisterParticipant(activityName, email);
  });

  fetchActivities();
});
