// const {Client, Account, Database, ID, Query} = Appwrite
// const  projectId= '66c9cbb200176ebfc112'
// const databaseId='66c9cc3a002dc627e895'
// const collectionId='66c9cc5f00181cd6d333'

// const client= new Client().setEndpoint('https://cloud.appwrite.io/v1').
// setProject(projectId)

// const account= new Account(client)
// const database= new Database(client)

// function register(event){
//     account.create(
//         ID.unique(),
//         event.target.elements['register-email'].value,
//         event.target.elements['register-password'].value,
//         event.target.elements['register-username'].value,

//     ).then(response => {
//         console.log(response)
//         //create a document in a database
//         database.createDocument(
//             databaseId,
//             collectionId,
//             response.$id,
//             {
//                 "userId": response.$id, 
//                 "highscore":0,
//             }

//         )
    
//     account.createEmailSession(
//         event.target.elements['register-email'].value,
//         event.target.element['register-password'].value
//     ).then(() => {
//         showDisplay(response.$id)
//     })
// }).catch(error=>console.error(error))
// event.preventDefault()
// }

// function login(event){

// }
// function showDisplay(){
// const modalElement = document.getElementById('modal')
// modalElement.classList.add('hidden')
// }
// showDisplay()


kaboom({
    global: true,
    fullscreen :true,
    scale:1,
    debug:true,
    clearColor: [0,0,0,1],
})

const MOVE_SPEED=120
const JUMP_FORCE=360
const BIG_JUMP_FORCE=550
let CURRENT_JUMP_FORCE= JUMP_FORCE
const ENEMY_SPEED=20

    // //Speed identifiers
    // const moveSpeed= 120
    // const jumpForce=360
    // const bigJumpForce= 550
    // let currentJumpForce = jumpForce
    const FALL_DEATH= 400
    // const enemyDeath = 20
    
    //Game logic
    let isJumping = true;

    loadRoot('https://i.imgur.com/')
    loadSprite('coin','wbKxhcd.png')
    loadSprite('evil-shroom','KP03fR9.png')
    loadSprite('brick', 'pogC9x5.png')
    loadSprite('block', 'M6rwarW.png')
    loadSprite('mario', 'Wb1qfhk.png')
    loadSprite('mushroom', '0wMd92p.png')
    loadSprite('surprise', 'gesQ1KP.png')
    loadSprite('unboxed', 'bdrLpi6.png')

    loadSprite('pipe-top-left', 'ReTPiWY.png')
    loadSprite('pipe-top-right', 'hj2GK4n.png')
    loadSprite('pipe-bottom-left', 'c1cYSbt.png')
    loadSprite('pipe-bottom-right', 'nqQ79eI.png')
    loadSprite('blue-block', 'fVscIbn.png')
    loadSprite('blue-brick', '3e5YRQd.png')
    loadSprite('blue-steel', 'gqVoI2b.png')
    loadSprite('blue-evil-mushroom', 'SvV4ueD.png')
    // loadSprite('blue-surprise', 'RMqCc1G.png')

    scene("game", ({level,score})=>{
        layers(["bg", "obj", "ui"], "obj")
        const maps =[
            [
            '                                    ',
            '                                    ',
            '                                    ',
            '                                    ',
            '                                    ',
            '         %     =*=%=                ',
            '                         -+         ',
            '                   ^   ^ ()         ',
            '============================  ======'
            ],

            [   '                                    !',
                '                                    !',
                '                                    !',
                '                                    !',
                '    @@@                             !',
                '         %     =%==*                !',
                '        x                        -+ !',
                '       xx     x      ^   ^       () !',
                'zzzzzzzzzzzzzzzzzzzzzzzzzz  zzzzzzzz!']
        ]
        const levelCfg={
            width: 20,
            height: 20,
            '=': [sprite('block'), solid()],
            '$': [sprite('coin'), 'coin'],
            '%': [sprite('surprise'), solid(), 'coin-surprise'],
            '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
            '}': [sprite('unboxed'), solid()],
            '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
            ')': [sprite('pipe-bottom-right'), solid(),scale(0.5)],
            '-': [sprite('pipe-top-left'), solid(), scale(0.5),'pipe'],
            '+': [sprite('pipe-top-right'), solid(), scale(0.5),'pipe'],
            '^': [sprite('blue-evil-mushroom'), solid(), 'dangerous', scale(0.5)],
            '#': [sprite('mushroom'), solid(), 'mushroom', body()],
            '!': [sprite('blue-block'), solid()],
            'z': [sprite('blue-brick'), solid(), scale(0.5)],
            // '@': [sprite('blue-surprise'), solid(), body(), scale(0.5), 'coin-surprise'],
            'x': [sprite('blue-steel'), solid(),scale(0.5)],

        }
        const gameLevel= addLevel(maps[level], levelCfg)

        const scoreLabel = add([
             text(score),
             pos(30,6),
             layer('ui'),
             {
                value:score,
             }
        ])
        add([text('level'+ parseInt(level+1)), pos(40,6)])

        function big(){
            let timer=0
            let isBig= false
            return{
                update(){
                    if (isBig){
                        CURRENT_JUMP_FORCE= BIG_JUMP_FORCE
                        timer -=dt()
                        if (timer <= 0){
                            this.smallify()
                        }
                    }
                },
                isBig(){
                    return isBig
                },
                smallify(){

                    this.scale= vec2(1) 
                    CURRENT_JUMP_FORCE= BIG_JUMP_FORCE

                    timer=0
                    isBig= false
                },
                biggify(time){
                    this.scale= vec2(2) 
                    timer= time
                    isBig= true
                }
            }
        }

        const player= add([
            sprite('mushroom'), solid(),
            pos(30,0),
            body(),
            big(),
            origin('bot')
        ])

        action('mushroom', (m)=>{
          m.move(20,0)
                })
        player.on("headbump", (obj)=>{
            if (obj.is('coin-surprise')){
               gameLevel.spawn('$', obj.gridPos.sub(0,1))
               destroy(obj) 
               gameLevel.spawn('}', obj.gridPos.sub(0,0))
            }

            if (obj.is('mushroom-surprise')){
                gameLevel.spawn('#', obj.gridPos.sub(0,1))
                destroy(obj) 
                gameLevel.spawn('}', obj.gridPos.sub(0,0))
             }
        })

       

        player.collides('mushroom',(m)=>{
            destroy(m)
            player.biggify(6)
        })
        player.collides('coin',(c)=>{
            destroy(c)
            player.biggify(6)
            scoreLabel.value++
            scoreLabel.text=scoreLabel.value
        })

         action('dangerous', (d)=>{
            d.move(-ENEMY_SPEED,0)
        })
        player.collides('dangerous', (d)=>{
            if(isJumping){
                destroy(d)
            }else{
            go('lose', {score: scoreLabel.value})
            }
        })

        player.action(()=>{
            camPos(player.pos)
            if(player.pos.y>=FALL_DEATH){
                go('lose',{score:scoreLabel.value})
            }
        })
        
        player.collides('pipe',()=>{

            keyPress('down',()=>{
                go('game',{
                    level:(level+1)%maps.length,
                    score:scoreLabel.value
                })
            })
        })



        keyDown('left',()=>{
            player.move(-MOVE_SPEED,0)
        })

        keyDown('right', ()=>{
            player.move(MOVE_SPEED,0)
        })

        player.action(()=>{
            if(player.grounded()){
                isJumping=false
            }


        })
        keyPress('space',()=>{
            if(player.grounded()){
                isJumping= true
                player.jump(CURRENT_JUMP_FORCE)
            }
        })
    })

    scene ('lose', ({score})=>{
        add([text(score,32),origin('center'), pos(width()/2, height()/2)])
    })




    start("game", {level:0, score:0})

