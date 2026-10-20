import 'dart:math';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Add generated Firebase options for your app, then uncomment:
  // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const LudoApp());
}

const bg = Color(0xFF101426);
const gold = Color(0xFFFFC857);
const colors = [Color(0xFFEF476F), Color(0xFF06D6A0), Color(0xFF118AB2), Color(0xFFFFC857)];
const names = ['RUBY', 'JADE', 'SAPPHIRE', 'GOLD'];
const emojis = ['❤️', '😂', '🔥', '👏', '😎', '🎲'];

class LudoApp extends StatelessWidget {
  const LudoApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Ludo Royal', debugShowCheckedModeBanner: false,
    theme: ThemeData.dark().copyWith(
      scaffoldBackgroundColor: bg, colorScheme: ColorScheme.fromSeed(seedColor: gold, brightness: Brightness.dark),
      textTheme: ThemeData.dark().textTheme.apply(fontFamily: 'Roboto'),
    ),
    home: const HomePage(),
  );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override State<HomePage> createState() => _HomePageState();
}
class _HomePageState extends State<HomePage> {
  String playerName = 'PLAYER ONE';
  int players = 2;
  bool online = false;
  bool ai = true;
  final nameController = TextEditingController(text: 'PLAYER ONE');
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Container(
      decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF20264A), bg, Color(0xFF241B3D)])),
      child: SafeArea(child: ListView(padding: const EdgeInsets.all(22), children: [
        const SizedBox(height: 22),
        const Icon(Icons.casino_rounded, size: 62, color: gold),
        const SizedBox(height: 8),
        const Text('LUDO ROYAL', textAlign: TextAlign.center, style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, letterSpacing: 3, color: gold)),
        const Text('ROLL. RACE. RULE THE BOARD.', textAlign: TextAlign.center, style: TextStyle(letterSpacing: 2, color: Colors.white70, fontSize: 11)),
        const SizedBox(height: 30),
        _panel(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('PLAYER PROFILE', style: TextStyle(color: gold, fontWeight: FontWeight.bold, letterSpacing: 1.4)),
          const SizedBox(height: 10),
          TextField(controller: nameController, maxLength: 18, decoration: const InputDecoration(labelText: 'Display name', prefixIcon: Icon(Icons.person), counterText: '')),
          const SizedBox(height: 12),
          const Text('GAME MODE', style: TextStyle(color: gold, fontWeight: FontWeight.bold, letterSpacing: 1.4)),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: _choice('Offline', !online, () => setState(() => online = false), Icons.smartphone)),
            const SizedBox(width: 10),
            Expanded(child: _choice('Online room', online, () => setState(() => online = true), Icons.public)),
          ]),
          const SizedBox(height: 18),
          const Text('PLAYERS', style: TextStyle(color: gold, fontWeight: FontWeight.bold, letterSpacing: 1.4)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, children: [2,3,4].map((n) => ChoiceChip(label: Text('$n players'), selected: players == n, onSelected: (_) => setState(() => players = n))).toList()),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Play against computer AI'), value: ai, activeColor: gold, onChanged: (v) => setState(() => ai = v)),
        ])),
        const SizedBox(height: 18),
        SizedBox(height: 56, child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(backgroundColor: gold, foregroundColor: const Color(0xFF20182B), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
          icon: const Icon(Icons.play_arrow_rounded, size: 28),
          label: Text(online ? 'CREATE ONLINE ROOM' : 'START GAME', style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.4)),
          onPressed: () {
            playerName = nameController.text.trim().isEmpty ? 'PLAYER ONE' : nameController.text.trim();
            if (online) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => OnlinePage(name: playerName)));
            } else {
              Navigator.push(context, MaterialPageRoute(builder: (_) => GamePage(players: players, playerName: playerName, ai: ai)));
            }
          },
        )),
        const SizedBox(height: 18),
        const Text('✨ 3D-inspired board • Animated dice • Smart AI • Emoji reactions', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, fontSize: 12)),
      ])),
    ),
  );
  Widget _panel(Widget child) => Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: Colors.white.withOpacity(.06), border: Border.all(color: Colors.white12), borderRadius: BorderRadius.circular(24), boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 24, offset: Offset(0,12))]), child: child);
  Widget _choice(String text, bool selected, VoidCallback tap, IconData icon) => Expanded(child: InkWell(onTap: tap, borderRadius: BorderRadius.circular(14), child: Container(padding: const EdgeInsets.symmetric(vertical: 14), decoration: BoxDecoration(color: selected ? gold.withOpacity(.17) : Colors.white.withOpacity(.04), borderRadius: BorderRadius.circular(14), border: Border.all(color: selected ? gold : Colors.white12)), child: Column(children: [Icon(icon, color: selected ? gold : Colors.white70), const SizedBox(height: 5), Text(text, style: TextStyle(fontWeight: FontWeight.bold, color: selected ? gold : Colors.white70))]))));
}

class Token {
  int progress = -1; // -1 = home; 0..51 = shared track; 52 = finished
  Token();
}
class Player {
  Player(this.index, this.name, this.color, this.isAi);
  final int index; final String name; final Color color; final bool isAi;
  final tokens = List.generate(4, (_) => Token());
  int get finished => tokens.where((t) => t.progress == 52).length;
}
class GamePage extends StatefulWidget {
  const GamePage({super.key, required this.players, required this.playerName, required this.ai});
  final int players; final String playerName; final bool ai;
  @override State<GamePage> createState() => _GamePageState();
}
class _GamePageState extends State<GamePage> with SingleTickerProviderStateMixin {
  final random = Random();
  late List<Player> people;
  int turn = 0, dice = 1, rolls = 0;
  bool rolling = false, gameOver = false;
  String message = 'Roll a 6 to bring a token out of home.';
  late final AnimationController diceAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 550));
  @override void initState() {
    super.initState();
    people = List.generate(widget.players, (i) => Player(i, i == 0 ? widget.playerName : (widget.ai ? 'ROYAL AI ${i+1}' : 'PLAYER ${i+1}'), colors[i], widget.ai && i > 0));
  }
  @override void dispose() { diceAnim.dispose(); super.dispose(); }
  Future<void> roll() async {
    if (rolling || gameOver || (people[turn].isAi)) return;
    setState(() { rolling = true; message = '${people[turn].name} is rolling…'; });
    await diceAnim.forward(from: 0);
    final value = random.nextInt(6)+1;
    setState(() { dice = value; rolling = false; rolls++; message = value == 6 ? 'A SIX! Choose a token to move.' : 'Choose a token that can move.'; });
    if (!hasMove(people[turn], value)) {
      if (value != 6) nextTurn();
      else setState(() => message = 'No token can move. Roll again!');
    }
  }
  bool hasMove(Player p, int d) => p.tokens.any((t) => (t.progress == -1 && d == 6) || (t.progress >= 0 && t.progress < 52 && t.progress + d <= 52));
  void moveToken(int index) {
    if (rolling || gameOver || people[turn].isAi) return;
    final p = people[turn], token = p.tokens[index];
    if (token.progress == -1 && dice != 6) { setState(() => message = 'You need a 6 to launch a token.'); return; }
    if (token.progress >= 0 && token.progress < 52 && token.progress + dice > 52) { setState(() => message = 'Exact roll needed to finish.'); return; }
    if (token.progress == 52) return;
    setState(() {
      token.progress = token.progress == -1 ? 0 : token.progress + dice;
      message = token.progress == 52 ? '${p.name} finished a token!' : '${p.name} moved token ${index+1}.';
      if (p.finished == 4) { gameOver = true; message = '🏆 ${p.name} WINS THE GAME!'; }
      if (!gameOver && dice != 6) nextTurn();
    });
  }
  void nextTurn() {
    turn = (turn + 1) % people.length;
    if (mounted) setState(() {});
    if (people[turn].isAi && !gameOver) Future.delayed(const Duration(milliseconds: 700), aiMove);
  }
  void aiMove() {
    if (!mounted || gameOver || !people[turn].isAi) return;
    setState(() { dice = random.nextInt(6)+1; message = '${people[turn].name} rolled $dice'; });
    final p = people[turn];
    final options = <int>[];
    for (var i=0;i<p.tokens.length;i++) {
      final t=p.tokens[i];
      if ((t.progress == -1 && dice == 6) || (t.progress >= 0 && t.progress < 52 && t.progress+dice <= 52)) options.add(i);
    }
    if (options.isEmpty) { nextTurn(); return; }
    options.sort((a,b) => p.tokens[b].progress.compareTo(p.tokens[a].progress));
    final t=p.tokens[options.first];
    t.progress = t.progress == -1 ? 0 : t.progress+dice;
    if (p.finished == 4) { gameOver=true; message='🏆 ${p.name} WINS THE GAME!'; setState((){}); return; }
    if (dice != 6) nextTurn(); else setState(() {});
  }
  @override Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('LUDO ROYAL', style: TextStyle(color: gold, fontWeight: FontWeight.w900, letterSpacing: 2)), backgroundColor: Colors.transparent, actions: [IconButton(onPressed: () => showModalBottomSheet(context: context, backgroundColor: const Color(0xFF20264A), builder: (_) => SafeArea(child: Padding(padding: const EdgeInsets.all(20), child: Wrap(spacing: 10, children: emojis.map((e) => TextButton(onPressed: () { Navigator.pop(context); setState(() => message = '${people[turn].name} says $e'); }, child: Text(e, style: const TextStyle(fontSize: 28)))).toList()))), icon: const Icon(Icons.emoji_emotions_outlined, color: gold))]),
    body: SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6), child: Row(children: people.map((p) => Expanded(child: Container(margin: const EdgeInsets.symmetric(horizontal: 3), padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: p.color.withOpacity(turn == p.index ? .24 : .08), borderRadius: BorderRadius.circular(12), border: Border.all(color: turn == p.index ? p.color : Colors.white10)), child: Column(children: [Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 10, color: p.color, fontWeight: FontWeight.bold)), Text('${p.finished}/4', style: const TextStyle(fontWeight: FontWeight.w900))])))).toList())),
      Expanded(child: Center(child: AspectRatio(aspectRatio: 1, child: Padding(padding: const EdgeInsets.all(10), child: _board())))),
      Container(width: double.infinity, margin: const EdgeInsets.fromLTRB(16,0,16,12), padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.white.withOpacity(.06), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white12)), child: Column(children: [
        Text(message, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          GestureDetector(onTap: roll, child: AnimatedBuilder(animation: diceAnim, builder: (_,__) => Transform.rotate(angle: diceAnim.value * pi * 2, child: Container(width: 62, height: 62, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 14, offset: Offset(0,7))]), child: Center(child: Text(['⚀','⚁','⚂','⚃','⚄','⚅'][dice-1], style: const TextStyle(color: bg, fontSize: 43))))))),
          const SizedBox(width: 20),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('TURN ${turn+1}', style: const TextStyle(color: gold, fontWeight: FontWeight.w900)), Text(people[turn].name, style: const TextStyle(fontSize: 12, color: Colors.white70))]),
          const SizedBox(width: 18),
          IconButton(onPressed: () => setState(() { for (final p in people) for(final t in p.tokens) t.progress=-1; turn=0; dice=1; gameOver=false; message='New game started.'; }), icon: const Icon(Icons.refresh, color: gold), tooltip: 'Restart'),
        ]),
        const SizedBox(height: 8),
        const Text('Tap a token in the board to move it after rolling.', style: TextStyle(fontSize: 11, color: Colors.white54)),
      ])),
    ])),
  );
  Widget _board() {
    return Container(decoration: BoxDecoration(color: const Color(0xFFEEE9DC), borderRadius: BorderRadius.circular(22), boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 24, offset: Offset(0,12))], border: Border.all(color: gold, width: 3)), child: ClipRRect(borderRadius: BorderRadius.circular(18), child: LayoutBuilder(builder: (context, c) {
      final s=c.maxWidth;
      return Stack(children: [
        Positioned(left:0,top:0,width:s/2,height:s/2,child:_homeArea(0)),
        Positioned(right:0,top:0,width:s/2,height:s/2,child:_homeArea(1)),
        Positioned(left:0,bottom:0,width:s/2,height:s/2,child:_homeArea(2)),
        Positioned(right:0,bottom:0,width:s/2,height:s/2,child:_homeArea(3)),
        Positioned(left:s*.34,top:s*.34,width:s*.32,height:s*.32,child:CustomPaint(painter: CenterStarPainter())),
        for(int i=0;i<people.length;i++)
          for(int j=0;j<4;j++)
            if(people[i].tokens[j].progress == -1)
              Positioned(left: _homePos(i,j,s).dx, top: _homePos(i,j,s).dy, child: GestureDetector(onTap: () { if (i == turn) moveToken(j); }, child: _token(people[i].color, j)))
            else if(people[i].tokens[j].progress < 52)
              Positioned(left: _trackPos(people[i].tokens[j].progress,i,s).dx, top: _trackPos(people[i].tokens[j].progress,i,s).dy, child: GestureDetector(onTap: () => moveToken(j), child: _token(people[i].color,j))),
        if(gameOver) Positioned.fill(child: Container(color: Colors.black54, child: Center(child: Text('🏆 WINNER 🏆\\n${message.replaceAll('🏆 ', '').replaceAll(' WINS THE GAME!', '')}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: gold))))),
      ]);
    })));
  }
  Widget _homeArea(int i) {
    final col=colors[i];
    return Container(color: col.withOpacity(.88), padding: const EdgeInsets.all(10), child: Container(decoration: BoxDecoration(color: const Color(0xFFEEE9DC), borderRadius: BorderRadius.circular(12)), child: Center(child: Icon(Icons.diamond_rounded, color: col.withOpacity(.55), size: 38))));
  }
  Offset _homePos(int p,int t,double s) {
    final base=[Offset(.09,.09),Offset(.59,.09),Offset(.09,.59),Offset(.59,.59)][p];
    final sub=[Offset(.04,.04),Offset(.19,.04),Offset(.04,.19),Offset(.19,.19)][t];
    return Offset((base.dx+sub.dx)*s,(base.dy+sub.dy)*s);
  }
  Offset _trackPos(int progress,int player,double s) {
    final angle = (progress / 52 * 2 * pi) - pi/2 + player*pi/2;
    final r=s*.32;
    return Offset(s/2 + cos(angle)*r - 10, s/2 + sin(angle)*r - 10);
  }
  Widget _token(Color color,int n) => Container(width: 20,height: 20, decoration: BoxDecoration(color: color, shape: BoxShape.circle, border: Border.all(color: Colors.white,width:2), boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 5, offset: Offset(0,3))]), child: Center(child: Text('${n+1}', style: const TextStyle(fontSize: 8,fontWeight: FontWeight.w900,color: Colors.white))));
}

class CenterStarPainter extends CustomPainter {
  @override void paint(Canvas canvas, Size size) {
    final p=Paint()..style=PaintingStyle.fill;
    final center=Offset(size.width/2,size.height/2);
    final points=[Offset(0,0),Offset(size.width,0),Offset(size.width,size.height),Offset(0,size.height)];
    for(var i=0;i<4;i++) { p.color=colors[i]; final path=Path()..moveTo(center.dx,center.dy)..lineTo(points[i].dx,points[i].dy)..lineTo(points[(i+1)%4].dx,points[(i+1)%4].dy)..close(); canvas.drawPath(path,p); }
    canvas.drawCircle(center, size.width*.11, Paint()..color=gold);
  }
  @override bool shouldRepaint(covariant CustomPainter oldDelegate)=>false;
}

class OnlinePage extends StatefulWidget {
  const OnlinePage({super.key, required this.name});
  final String name;
  @override State<OnlinePage> createState()=>_OnlinePageState();
}
class _OnlinePageState extends State<OnlinePage> {
  final roomController=TextEditingController();
  String status='Online multiplayer needs Firebase setup.';
  bool busy=false;
  Future<void> connect(bool create) async {
    setState(()=>busy=true);
    try {
      if (Firebase.apps.isEmpty) throw Exception('Firebase is not configured. Follow README setup steps.');
      final auth=FirebaseAuth.instance;
      final user=auth.currentUser ?? (await auth.signInAnonymously()).user!;
      final db=FirebaseDatabase.instance.ref('rooms');
      final room=create ? (100000+Random().nextInt(899999)).toString() : roomController.text.trim();
      if(room.isEmpty) throw Exception('Enter a room code.');
      final ref=db.child(room);
      if(create) {
        await ref.set({'host':user.uid,'status':'waiting','createdAt':ServerValue.timestamp,'players':{user.uid:{'name':widget.name,'joinedAt':ServerValue.timestamp}}});
        await ref.child('chat').push().set({'name':'SYSTEM','text':'Room created. Share code $room','at':ServerValue.timestamp});
      } else {
        final snap=await ref.get();
        if(!snap.exists) throw Exception('Room not found.');
        await ref.child('players/${user.uid}').set({'name':widget.name,'joinedAt':ServerValue.timestamp});
        await ref.child('chat').push().set({'name':'SYSTEM','text':'${widget.name} joined the room','at':ServerValue.timestamp});
      }
      if(!mounted)return;
      setState(()=>status='Connected to room $room. Live lobby ready; sync game turns through this room in the next integration step.');
      roomController.text=room;
      showDialog(context:context,builder:(_)=>AlertDialog(title:const Text('Room ready'),content:SelectableText('Room code: $room\\nShare this code with friends.\\n\\nPlayer ID: ${user.uid}'),actions:[TextButton(onPressed:()=>Navigator.pop(context),child:const Text('OK'))]));
    } catch(e) { if(mounted)setState(()=>status=e.toString().replaceFirst('Exception: ','') ); }
    finally { if(mounted)setState(()=>busy=false); }
  }
  @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('ONLINE ROOMS')),body:Padding(padding:const EdgeInsets.all(22),child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[
    const Icon(Icons.public,color:gold,size:60),const SizedBox(height:16),
    const Text('PLAY WITH FRIENDS',textAlign:TextAlign.center,style:TextStyle(fontSize:22,fontWeight:FontWeight.w900,color:gold)),
    const SizedBox(height:20),
    TextField(controller:roomController,decoration:const InputDecoration(labelText:'Room code to join',prefixIcon:Icon(Icons.meeting_room))),
    const SizedBox(height:12),
    ElevatedButton(onPressed:busy?null:()=>connect(false),child:const Text('JOIN ROOM')),
    OutlinedButton(onPressed:busy?null:()=>connect(true),child:const Text('CREATE ROOM')),
    const SizedBox(height:20),Text(status,textAlign:TextAlign.center,style:const TextStyle(color:Colors.white70)),
    const Spacer(),const Text('For real-time online gameplay, connect Firebase and add synchronized game-state events; see README.',textAlign:TextAlign.center,style:TextStyle(color:Colors.white54,fontSize:12))
  ])));
}
