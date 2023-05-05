function Checked(event) {
  data = event.target.id;
  const csrftoken = Cookies.get("csrftoken");
  
  fetch("/web/list/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({"data": data}),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .then((jsonData) => {
      json = jsonData["data"][0];
      checkbox = document.getElementById(data);
      is_checked = checkbox.checked;
      
      resultDiv = document.querySelector('#detail');
      if (is_checked) {
        resultDiv.innerHTML = `
        <li id='${data}'> 서비스 ID: = ${json['서비스ID']} </li>
        <li id='${data}'> 서비스명: = ${json['서비스명']} </li>
        <li id='${data}'> 서비스 설명: =${json['서비스설명']} </li>
        <li id='${data}'> URL: = ${json['urls']} </li>
      `
      } else {
        try{
          del = document.querySelectorAll(`li[id='${data}']`);
          for (var i = 0; i < del.length; i++) {
            del[i].remove()
          }
        } catch{
        }
      }
    })
    .catch((error) => console.error(error));
}