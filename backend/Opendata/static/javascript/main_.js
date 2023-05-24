// <div class = "graph"> 에 3D graph 생성
const graph_elem = document.querySelector(".graph");
const Graph = ForceGraph3D()(graph_elem);

// 모달 선택
const modal_overlay = document.querySelector(".modal_overlay");
const graph_make_modal = document.querySelector(".graph_make_modal");
const topic_make_modal = document.querySelector(".topic_make_modal");
const detail_info_modal = document.querySelector(".detail_info_modal");

// 데이터 정보 선택
const data_info_lists = document.querySelectorAll(
    ".data_info .content_list > li > .val"
);

// const data_info_id = document.querySelector(
//     ".data_info .content_list > li:nth-child(1) > .val"
// );
// const data_info_name = document.querySelector(
//     ".data_info .content_list > li:nth-child(2) > .val"
// );
// const data_info_class = document.querySelector(
//     ".data_info .content_list > li:nth-child(3) > .val"
// );
// const data_info_type = document.querySelector(
//     ".data_info .content_list > li:nth-child(4) > .val"
// );
// const data_info_description = document.querySelector(
//     ".data_info .content_list > li:nth-child(5) > .val"
// );

// 상세 정보 선택
const detail_info_lists = document.querySelectorAll(
    ".modal_overlay .detail_info_modal .modal_content .detail_list > li > .val"
);
const page_link = document.querySelector(
    ".modal_overlay .detail_info_modal .modal_content .url_link"
);

// const data_info_detail_id = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(1) > .val"
// );
// const data_info_detail_name = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(2) > .val"
// );
// const data_info_detail_description = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(3) > .val"
// );

// const data_info_detail_type = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(4) > .val"
// );
// const data_info_detail_URL = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(5) > .val"
// );

// const data_info_detail_major = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(6) > .val"
// );
// const data_info_detail_middle = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(7) > .val"
// );
// const data_info_detail_sub = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(8) > .val"
// );

// const data_info_detail_system = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(9) > .val"
// );
// const data_info_detail_agency = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(10) > .val"
// );
// const data_info_detail_department = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(11) > .val"
// );

// const data_info_detail_charge_nm = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(12) > .val"
// );
// const data_info_detail_charge_tel = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(13) > .val"
// );

// const data_info_detail_renewal_cycle = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(14) > .val"
// );
// const data_info_detail_final_renewal = document.querySelector(
//     ".modal_overlay .detail_info_modal .modal_content .detail_list > li:nth-child(15) > .val"
// );

// 유사 데이터 div 선택
const similar_data_content = document.querySelector(
    ".similar_data .similar_list"
);

// 관심 데이터 div 선택
const interest_data_content = document.querySelector(
    ".selected_data .selected_list"
);

// 검색 선택
const search_input = document.querySelector(".search");
const autocomplete_list = document.querySelector(".autocomplete_list");

window.onload = function () {
    Graph.onNodeClick((node) => {
        select_node(node);
    });

    // search button click -> 검색창에 있는 value 찾아줌
    let search = document.querySelector(".search_button");
    search.addEventListener("click", (e) => {
        let search_target = document.querySelector(".search").value;
        //console.log("search_target: ", search_target)
        search_node(parseInt(search_target));
    });
};

function select_node(node) {
    Checked(node);
    // get_adjacent_data(node)

    const distance = 400;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
        node.x || node.y || node.z
            ? {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        1500 // ms transition duration
    );
}

function search_node(idx) {
    try {
        select_node(gData.nodes[idx]);
    } catch {
        console.log(`failed to search ${idx}`);
    }
}

function Checked(node) {
    let nodeData = node.id;
    const csrftoken = Cookies.get("csrftoken");

    fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: nodeData }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .then((jsonData) => {
            // console.log("jsonData: ", jsonData)

            // detail data info
            let detail = jsonData["detail_data"][0];

            // similar data info
            let similar_data = new Array();
            for (let i = 0; i < 5; i++) {
                similar_data.push(jsonData["similar_data"][i][0]);
            }

            // Insert info
            let data_info_strs = [
                `${detail["서비스ID"]}`,
                `${detail["서비스명"]}`,
                `${detail["대분류"]} / ${detail["중분류"]} / ${detail["소분류"]}`,
                `${detail["제공형식"]}`,
                `${detail["서비스설명"]}`,
            ];
            for (let idx in data_info_lists) {
                data_info_lists[idx].innerText = data_info_strs[idx];
            }

            // data_info_id.innerText = `${detail["서비스ID"]}`;
            // data_info_name.innerText = `${detail["서비스명"]}`;
            // data_info_class.innerText = `${detail["대분류"]} / ${detail["중분류"]} / ${detail["소분류"]}`;
            // data_info_type.innerText = `${detail["제공형식"]}`;
            // data_info_description.innerText = `${detail["서비스설명"]}`;

            // Insert detail info
            let detail_info_strs = [
                `${detail["서비스ID"]}`,
                `${detail["서비스명"]}`,
                `${detail["대분류"]}`,
                `${detail["중분류"]}`,
                `${detail["소분류"]}`,
                `${detail["제공형식"]}`,
                `${detail["서비스설명"]}`,
                `${detail["시스템명"]}`,
                `${detail["제공기관"]}`,
                `${detail["제공부서명"]}`,
                `${detail["담당자명"]}`,
                `${detail["담당자연락처"]}`,
                `${detail["갱신주기"]}`,
                `${detail["최종갱신일자"]}`,
            ];

            for (let idx in detail_info_lists) {
                detail_info_lists[idx].innerText = detail_info_strs[idx];
            }
            page_link.setAttribute("href", detail["urls"]);

            // data_info_detail_id.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["서비스ID"]} </li>`;
            // data_info_detail_name.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["서비스명"]} </li>`;
            // data_info_detail_description.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["서비스설명"]} </li>`;

            // data_info_detail_type.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["제공형식"]} </li>`;
            // data_info_detail_URL.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["urls"]} </li>`;

            // data_info_detail_major.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["대분류"]} </li>`;
            // data_info_detail_sub.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["중분류"]} </li>`;
            // data_info_detail_middle.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["소분류"]} </li>`;

            // data_info_detail_system.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["시스템명"]} </li>`;
            // data_info_detail_agency.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["제공기관"]} </li>`;
            // data_info_detail_department.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["제공부서명"]} </li>`;

            // data_info_detail_charge_nm.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["담당자명"]} </li>`;
            // data_info_detail_charge_tel.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["담당자연락처"]} </li>`;

            // data_info_detail_renewal_cycle.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["갱신주기"]} </li>`;
            // data_info_detail_final_renewal.innerHTML = `<li id='${detail["서비스ID"]}'>${detail["최종갱신일자"]} </li>`;

            // Insert similar data
            similar_data_content.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                let sim_li = document.createElement("li");

                sim_li.setAttribute("id", similar_data[i]["서비스ID"]);

                let scrolled_text = document.createElement("label");
                scrolled_text.classList.add("scrolled_text");
                scrolled_text.innerText = similar_data[i]["서비스명"];
                sim_li.appendChild(scrolled_text);

                similar_data_content.appendChild(sim_li);
            }
            //     similar_data_content.innerHTML = `
            // <li id='${similar_0["서비스ID"]}'>${similar_0["서비스명"]}</li>
            // <li id='${similar_1["서비스ID"]}'>${similar_1["서비스명"]}</li>
            // <li id='${similar_2["서비스ID"]}'>${similar_2["서비스명"]}</li>
            // <li id='${similar_3["서비스ID"]}'>${similar_3["서비스명"]}</li>
            // <li id='${similar_4["서비스ID"]}'>${similar_4["서비스명"]}</li>
            // `;
        })
        .catch((error) => console.error(error));
}

function basket() {
    let cart_data_id = document.querySelector(
        ".data_info .content_list > li:nth-child(1) > .val > .liVal"
    ).innerHTML;
    let cart_data_name = document.querySelector(
        ".data_info .content_list > li:nth-child(2) > .val > .liVal"
    ).innerHTML;
    if (cart_data_id) {
        console.log("basketData", cart_data_id);
        console.log("basketData", cart_data_name);
        let bas_li = document.createElement("li");
        bas_li.setAttribute("id", cart_data_id);

        let scrolled_text = document.createElement("label");
        scrolled_text.classList.add("scrolled_text");
        scrolled_text.innerText = cart_data_name;
        bas_li.appendChild(scrolled_text);

        interest_data_content.appendChild(bas_li);

        // interest_data_content.innerHTML = `<li>${cart_data_name}</li>`;
    } else {
        console.log("정보가 없습니다.");
    }
}

// 드래그 앤 드랍 코드
function dragElement(elmnt, target_elemnt) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        target_elemnt.style.top = target_elemnt.offsetTop - 10 - pos2 + "px";
        target_elemnt.style.left = target_elemnt.offsetLeft - 10 - pos1 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function load() {
    return fetch("/web/node-coordinate/").then((response) => response.json());
}

function once() {
    if (is_action === true) {
        is_action = false;
        return false;
    } else {
        is_action = true;
        return true;
    }
}
//link 생성
function similar_link(node_source, node_target) {
    var person1 = new Object();
    person1.source = node_source.id;
    person1.target = node_target.id;
    return person1;
}
//randomnum
function getRandomNum() {
    min = -40;
    max = +40;
    return parseFloat((Math.random() * (max - min) + min).toFixed(3));
}
function intoTheNode(node, Graph) {
    const distance = 120;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
        node.x || node.y || node.z
            ? {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
    );
}
is_action = false;
//유사 데이터 불러오기
function similardata(nh) {
    console.log("similar입니다", 1);
    let x = nh.fx;
    let y = nh.fy;
    let z = nh.fz;
    data_links = [];
    //유사도 패치 불러오기 return이 data 모양
    //data가 겹쳐서,, 그런다... 패치로 불러와야한다..
    if (is_action == false) {
        data_node = [
            { id: "일반행정", group: 5, collapsed: true, category: false },
            { id: "보건", group: 0, collapsed: true, category: false },
            { id: "문화/관광", group: 1, collapsed: true, category: false },
            { id: "산업/경제", group: 2, collapsed: true, category: false },
        ];
        is_action = once();
    } else {
        data_node = [
            { id: "안녕", group: 5, collapsed: true, category: false },
            { id: "호호", group: 0, collapsed: true, category: false },
            { id: "하/관광", group: 1, collapsed: true, category: false },
            { id: "경제", group: 2, collapsed: true, category: false },
        ];
        is_action = once();
    }

    data_node.forEach((i) => {
        i["fx"] = x + getRandomNum();
        i["fy"] = y + getRandomNum();
        i["fz"] = z + getRandomNum();
    });
    data_node.forEach((i) => {
        data_links.push(similar_link(nh, i));
    });
    return { nodes: data_node, links: data_links };
}

// 관심 데이터 버튼 클릭
var data_cart = document.querySelector(".data-select-button");
data_cart.addEventListener("click", (e) => {
    console.log("관심 버튼 클릭");
    basket();
});

(async function () {
    jsonData = await load(); // load도 상수화,, json이 달라지니까
    //const nodesById = Object.fromEntries(jsonData.nodes.map(node => [node.name, node]))
    const getNodesTree = (nh) => {
        const visibleNodes = [];
        const visibleLinks = [];
        jsonData.nodes.forEach((i) => visibleNodes.push(i));

        let arr = visibleNodes.filter((i) => {
            return i.collapsed == false;
        });
        console.log("arr", arr);

        if (!nh) {
            return { nodes: visibleNodes, links: visibleLinks };
        }

        if (!nh.collapsed) {
            console.log("collapsed");
            similar = similardata(nh);
            similar.nodes.forEach((i) => visibleNodes.push(i));
            similar.links.forEach((i) => visibleLinks.push(i));
        }

        if (arr) {
            arr.forEach((i) => {
                if (i != nh) {
                    similar = similardata(i);
                    similar.nodes.forEach((i) => visibleNodes.push(i));
                    similar.links.forEach((i) => visibleLinks.push(i));
                }
            });
        }

        console.log("visi", visibleNodes);
        return { nodes: visibleNodes, links: visibleLinks };
    };
    Graph.graphData(getNodesTree());
    Graph.onNodeClick((node) => {
        select_node(node);
        bool = Object.keys(node).includes("category");
        if (bool) {
            return;
        } else {
            node.collapsed = !node.collapsed; // toggle collapse state
        }
        Graph.graphData(getNodesTree(node));

        intoTheNode(node, Graph);
    });
    Graph.linkWidth(2);
    let search = document.querySelector(".search_button");
    search.addEventListener("click", (e) => {
        let search_target = document.querySelector(".search").value;
        search_node(parseInt(search_target));
    });

    let side_windows = document.querySelectorAll(".side_window");
    for (let side_window of side_windows) {
        dragElement(side_window.querySelector(".title"), side_window);
        dragElement(side_window.querySelector("button"), side_window);
    }

    let side_window_buttons = document.querySelectorAll(
        ".side_window > button"
    );

    for (let but of side_window_buttons) {
        but.addEventListener("click", (e) => {
            but.parentNode.classList.toggle("open");
        });
    }

    let graph_modal_open = document.querySelector(".graph_modal_open");
    graph_modal_open.addEventListener("click", (e) => {
        if (modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.remove("hidden");
        }
        if (graph_make_modal.classList.contains("hidden")) {
            graph_make_modal.classList.remove("hidden");
        }
    });

    let graph_modal_close = document.querySelector(".graph_modal_close");
    graph_modal_close.addEventListener("click", (e) => {
        if (!modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.add("hidden");
        }
        if (!graph_make_modal.classList.contains("hidden")) {
            graph_make_modal.classList.add("hidden");
        }
    });

    let detail_modal_open = document.querySelector(".detail-button");
    detail_modal_open.addEventListener("click", (e) => {
        console.log("상세정보 버튼 클릭");
        if (modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.remove("hidden");
        }
        if (detail_info_modal.classList.contains("hidden")) {
            detail_info_modal.classList.remove("hidden");
        }
    });

    let detail_modal_close = document.querySelector(".detail_modal_close");
    detail_modal_close.addEventListener("click", (e) => {
        if (!modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.add("hidden");
        }
        if (!detail_info_modal.classList.contains("hidden")) {
            detail_info_modal.classList.add("hidden");
        }
    });

    let topic_modal_open = document.querySelector(".topic_modal_open");
    topic_modal_open.addEventListener("click", (e) => {
        if (modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.remove("hidden");
        }
        if (topic_make_modal.classList.contains("hidden")) {
            topic_make_modal.classList.remove("hidden");
        }
    });

    let topic_modal_close = document.querySelector(".topic_modal_close");
    topic_modal_close.addEventListener("click", (e) => {
        if (!modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.add("hidden");
        }
        if (!topic_make_modal.classList.contains("hidden")) {
            topic_make_modal.classList.add("hidden");
        }
    });
})();
