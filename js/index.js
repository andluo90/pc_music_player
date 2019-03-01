//自定义事件

let EventCenter = {
    on:function(type,fn){
        $(document).on(type,fn)
    },
    
    fire:function(type,data){
        $(document).trigger(type,data)
    }
}

let Api = {
    channels:"https://jirenguapi.applinzi.com/fm/getChannels.php",
    songs:"https://jirenguapi.applinzi.com/fm/getSong.php",
    lyric:"https://jirenguapi.applinzi.com/fm/getLyric.php"
}



let Fm = {
    init:function(){
        this.$container = $('#page-music main')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },

    bind:function(){

        let _this = this

        EventCenter.on('channel_change',(e,channel_obj)=>{
            this.channel_id = channel_obj.channel_id
            this.channel_name = channel_obj.channel_name
            this.load_music(this.set_music)

        })

        //播放/暂停
        this.$container.find('.btn-play').on('click',function(){
            if($(this).hasClass('icon-play')){
                $(this).removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            }else{
                $(this).removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })

        //下一首
        this.$container.find('.btn-next').on('click',function(){
            _this.load_music(_this.set_music)
        })

        this.audio.addEventListener('play',function(){
            clearInterval(_this.audio_clock)
            _this.audio_clock = setInterval(function(){
                update_status()
            },1000)
        })

        this.audio.addEventListener('pause',function(){
            clearInterval(_this.audio_clock)
            console.log("暂停中...")
            
        })

        function update_status(){
            let min = Math.floor(_this.audio.currentTime/60)
            let second = Math.floor(_this.audio.currentTime%60)+''
            second = second.length === 2 ? second:0+second
            let currentTime = `${min}:${second}`
            _this.$container.find('.current-time').text(currentTime)
            _this.$container.find('.bar-progress').css({width:_this.audio.currentTime*100/_this.audio.duration+'%'})
            console.log(_this.lyric_obj[0+currentTime])
            let current_lyric = _this.lyric_obj[0+currentTime]
            if(current_lyric){
                // _this.$container.find('.lyric p').html(`<p class="animated rollIn">${current_lyric}</p>`)
                _this.$container.find('.lyric p').text(current_lyric).boomText()

            }
        }

        
    },


    load_music:function(set_music){
        console.log("load music...")
        // $.getJSON("http://api.jirengu.com/fm/getSong.php",{channel:this.channel_id})
        $.getJSON(Api.songs,{channel:this.channel_id})

         .done((res)=>{
            console.log("加载音乐成功.")
            console.log(res)
            this.song = res.song[0]
            
            set_music.call(this)
         })
         .fail(function(){
             console.log("加载音乐失败.")
         })
    },

    set_music:function(){
        this.audio.src = this.song.url
        console.log("开始设置音乐.")
        $('.bg').css({'background-image':`url(${this.song.picture})`})
        this.$container.find('figure').css({'background-image':`url(${this.song.picture})`})
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.tag').text(this.channel_name)
        this.$container.find('.author').text(this.song.artist)
        this.$container.find('.btn-play').removeClass('icon-play icon-pause').addClass('icon-pause')
        this.load_lyric(this.song.sid)
    },

    load_lyric:function(sid){
        let _this = this
        // $.getJSON('http://api.jirengu.com/fm/getLyric.php',{sid:sid})
        $.getJSON(Api.lyric,{sid:sid})

         .done(function(res){
             console.log("获取歌词成功...")
             console.log(res)
             _this.lyric_obj = {}
             let lyric = res.lyric
             
             let times = null
             let  str = null
             lyric.split('\n').forEach((line)=>{
                 times = line.match(/\d{2}:\d{2}/g)
                 console.log(times)
                 str = line.replace(/\[.+?\]/g,'')
                 if(Array.isArray(times)){
                    times.forEach((time)=>{
                        _this.lyric_obj[time] = str
                    })
                 }
                 
             })
             

         })
         .fail(function(res){
            console.log("获取歌词失败...")
            console.log(res)
         })
    }
}

//footer模块
let  Footer = {
    init:function(){
        this.$footer = $('footer')
        this.$ul = $('footer ul')
        this.$box = $('footer .box')
        this.$ul_position_left = this.$ul.css('left')
        
        this.$foot_page_count = null
        
        this.$left_btn = $('footer .icon-left')
        this.$right_btn = $('footer .icon-right')

        this.$page_index = 1

        this.bind()
        this.render()
        console.log("初始化成功...")
    },
    
    bind:function(){
        let _this = this
        $(window).resize(function(){
            _this.setStyle()
        })

        this.$right_btn.on('click',function(){
            if(_this.$page_index<_this.$foot_page_count){
                let box_width = _this.$footer.find('.box').width()
                let li_width = _this.$footer.find('li').outerWidth(true)
                let per_page_count = Math.floor(box_width/li_width)


                _this.$ul.animate({left:'-='+ per_page_count*li_width},400)
                _this.$page_index+=1
            }else{
                console.log(`已翻到最后${_this.$page_index}页`)
            }
            
        })

        this.$left_btn.on('click',function(){
            if(_this.$page_index>1){
                let box_width = _this.$footer.find('.box').width()
                let li_width = _this.$footer.find('li').outerWidth(true)
                let per_page_count = Math.floor(box_width/li_width)


                _this.$ul.animate({left:'+='+ per_page_count*li_width},400)
                _this.$page_index-=1
            }else{
                console.log(`已翻到第${_this.$page_index}页`)
            }
        })

        this.$ul.on('click','li',function(e){
            let channel_id = e.currentTarget.dataset.channelId
            let channel_name = e.currentTarget.dataset.channelName
            if(!$(this).hasClass('active')){
                $(this).addClass('active').siblings().removeClass('active')
            }
            EventCenter.fire('channel_change',
                            {channel_id:channel_id,
                             channel_name:channel_name}
                            )

        })
        
    },

    render:function(){
        //  $.getJSON('http://api.jirengu.com/fm/getChannels.php')
         $.getJSON(Api.channels)

         
         .done( (data)=>{
             console.log("get josn done..")
             console.log(data)
             this.render_footer(data.channels)
         } )
    },

    render_footer:function(channels){
        //把li元素渲染到页面
        let = html_tmp = ''
        channels.forEach((item)=>{

        html_tmp += `
            <li data-channel-id="${item.channel_id}" data-channel-name="${item.name}">  
                <div class="cover" style="background-image:url(${item.cover_small})"></div>  
                <h3>${item.name}</h3>
            </li>
        `
        })
        
        this.$footer.find('ul').html(html_tmp)
        this.setStyle()
        
    },

    setStyle:function(){
        let li_widht = this.$footer.find('li').outerWidth(true)
        let li_count = this.$footer.find('li').length

        let ul_width = Math.ceil(li_count * li_widht)
        let box_width = this.$box.width()

        let per_page_li = (Math.floor(box_width/li_widht))
        this.$foot_page_count = Math.ceil(li_count/per_page_li)


        this.$footer.find('ul').css({width:ul_width})
    }
}

Footer.init()
Fm.init()

$.fn.boomText = function(type="rollIn"){
    this.html(()=>{
        let arr = $(this).text().split('').map((word)=>{
            return `<span>${word}</span>`
        })
        return arr.join('')
    })

    let index = 0
    let $words = $(this).find('span')
    let clock = setInterval(function(){
        $words.eq(index).addClass('animated '+type)
        index++
        if(index >= $words.length){
            clearInterval(clock)
        }
    },300)
}