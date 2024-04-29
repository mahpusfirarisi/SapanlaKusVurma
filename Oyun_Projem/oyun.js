//board
let karoboyutu = 32;
let satir = 14;
let sutunlar = 16;

let board;
let boardWidth = karoboyutu * sutunlar; // 32 * 16
let boardHeight = karoboyutu * satir; // 32 * 14
let context;

//sapan
let sapangenislik = karoboyutu * 1.8; // 32x1.8=57.6
let sapanyukseklik = karoboyutu * 1.8; // 32x1.8=57.6
let sapanX = karoboyutu * sutunlar / 2 - sapangenislik / 2; // Merkezlemek için genişliğin yarısını çıkarttım
let sapanY = karoboyutu * satir - sapanyukseklik - 10; // Biraz daha aşağıda görünmesini istedim

let sapan = {
    x: sapanX,
    y: sapanY,
    width: sapangenislik,
    height: sapanyukseklik
};



let sapanImg;
let sapanhizx = karoboyutu; //sapan hareket hızını ayarladım

//kuslar
let kusdizisi = [];
let kusgenislik = karoboyutu*1.8;
let kusyukseklik = karoboyutu;
let kusX = karoboyutu;
let kusY = karoboyutu;
let kusImg;

let kussatir = 1;
let kussutunu = 1;
let kussayim = 0; //vurulması gereken kus sayısını ayarladım
let kushizX = 0.7; //kus hareket hızını ayarladım

//taslar
let tasdizisi = [];
let tashisY = -9; //tas atıs hızının ayarlanmasını yaptım

let score = 0;
let bitti = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //board üzerine çizim için


    //resimleri yükleyedim
    sapanImg = new Image();
    sapanImg.src = "./sapan.png"; //sapan resmini aldım
    sapanImg.onload = function() {
        context.drawImage(sapanImg, sapan.x, sapan.y, sapan.width, sapan.height); //sapan resmini ayarladım
    }

    kusImg = new Image();
    kusImg.src = "./kus.png"; //kus resmini aldım
    kusyarat();

    requestAnimationFrame(update);
    document.addEventListener("keydown", sapanhareket);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (bitti) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //sapan
    context.drawImage(sapanImg, sapan.x, sapan.y, sapan.width, sapan.height);

    //kus
    for (let i = 0; i < kusdizisi.length; i++) {
        let kus = kusdizisi[i];
        if (kus.alive) {
            kus.x += kushizX;

            //kus sınırlara dokunursa
            if (kus.x + kus.width >= board.width || kus.x <= 0) {
                kushizX *= -1;
                kus.x += kushizX*2;

                //tüm kusları bir satir yukarı taşıdım
                for (let j = 0; j < kusdizisi.length; j++) {
                    kusdizisi[j].y += kusyukseklik;
                }
            }
            context.drawImage(kusImg, kus.x, kus.y, kus.width, kus.height);

            if (kus.y >= sapan.y) {
                bitti = true;
            }
        }
    }

    //taslar
    for (let i = 0; i < tasdizisi.length; i++) {
        let tas = tasdizisi[i];
        tas.y += tashisY;
        context.fillStyle="black";
        context.fillRect(tas.x, tas.y, tas.width, tas.height);

        //tas kusa carparsa
        for (let j = 0; j < kusdizisi.length; j++) {
            let kus = kusdizisi[j];
            if (!tas.used && kus.alive && detectCollision(tas, kus)) {
                tas.used = true;
                kus.alive = false;
                kussayim--;
                score += 10;
            }
        }
    }

    //tasları temizledim
    while (tasdizisi.length > 0 && (tasdizisi[0].used || tasdizisi[0].y < 0)) {
        tasdizisi.shift(); //dizinin ilk elemanını kaldırdım
    }

    //bir sonraki level 
    if (kussayim == 0) {
        //sutun ve satırdaki kus sayılarını bir arttırdık
        
        kussutunu = Math.min(kussutunu + 1, sutunlar/2 -2); 
        kussatir = Math.min(kussatir + 1, satir-4);
        if (kushizX > 0) {
            kushizX += 0.2; //kus hareket hızını sağa doğru arttırdım
        }
        else {
            kushizX -= 0.2; //kus hareket hızını sola doğru arttırdım
        }
        kusdizisi = [];
        tasdizisi = [];
        kusyarat();
    }

    //score
    context.fillStyle="black";
    context.font="32px Arial";
    context.fillText(score, 5, 30);
}

function sapanhareket(e) {
    if (bitti) {
        return;
    }

    if (e.code == "ArrowLeft" && sapan.x - sapanhizx >= 0) {
        sapan.x -= sapanhizx; //bir karo sola gitmesini sağladım
    }
    else if (e.code == "ArrowRight" && sapan.x + sapanhizx + sapan.width <= board.width) {
        sapan.x += sapanhizx; //bir karo sağa gitmesini sağladım
    }
}

function kusyarat() {
    for (let c = 0; c < kussutunu; c++) {
        for (let r = 0; r < kussatir; r++) {
            let kus = {
                img : kusImg,
                x : kusX + c*kusgenislik,
                y : kusY + r*kusyukseklik,
                width : kusgenislik,
                height : kusyukseklik,
                alive : true
            }
            kusdizisi.push(kus);
        }
    }
    kussayim = kusdizisi.length;
}

function shoot(e) {
    if (bitti) {
        return;
    }

    if (e.code == "Space") {
        //atıs
        let tas = {
            x : sapan.x + sapangenislik*15/32,
            y : sapan.y,
            width : karoboyutu/8,
            height : karoboyutu/2,
            used : false
        }
        tasdizisi.push(tas);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a'nın sol üst köşesi b'nin sağ üst köşesine ulaşmıyor
           a.x + a.width > b.x &&   //a'nın sağ üst köşesi b'nin sol üst köşesini geçiyor
           a.y < b.y + b.height &&  //a'nın sol üst köşesi b'nin sol alt köşesine ulaşmıyor
           a.y + a.height > b.y;    //a'nın sol alt köşesi b'nin sol üst köşesini geçiyor
}