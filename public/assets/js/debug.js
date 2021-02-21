const append = `
<style>
.__Debug{
    position: absolute;
    bottom: 0;
    left: 0;

    width: 25px;
    height: 25px;
    padding: 5px;

    background-color: #ffffff;
    background-image: url(/assets/img/warn.png);
    background-size: cover;

    filter: opacity(0.5) blur(1px);
    border-radius: 0px 10px 0px 0px;

    transition: .2s filter;
}
.__Debug:focus, .__Debug:hover{
    filter: opacity(0.75);
    outline: 0;
}
</style>
<div class="__Debug" tabindex="0"></div>
`;

$(document).ready(() => {
    $("body").append(append);
    $(".__Debug").on('click keypress', (e) => {
        debugStr = btoa(`${api.data.nonce}§${api.data.active}§${Date.now()}§${$("body").attr("style")}`);
        if ((e.type == "keypress") ? (e.code == "Enter") ? false : true : false)
            return;

        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(debugStr).select();
        document.execCommand("copy");
        $temp.remove();
        alert("Informação de debug copiada para a área de transferência. Envie essa informação ao desenvolvedor, junto com detalhes sobre o erro")
    })
})