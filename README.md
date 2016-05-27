# PWA RATP
Progressive Web App donnant les horaires des lignes de métro parisiennes. Sur
Android, elle est "installable", il suffit de l'ouvrir avec Chrome et de faire
"Ajouter à l'écran d'accueil".

Une démo est disponible en ligne sur https://ratp.garnier.wf. Bien entendu, les
données RATP n'étant pas publiques, le serveur fourni avec le projet permet de
générer des horaires aléatoires :)

Ce petit projet avait avant tout pour but de mettre en oeuvre Polymer et les
concepts de Progressive Web Apps poussés en ce moment par Google.

Aujourd'hui c'est à l'état de PoC, donc l'accent à pas été mis sur la
performance, ni sur les tests...

## Screenshots

![Screenshot de l'application](https://raw.githubusercontent.com/Kehrlann/pwa-ratp/master/screenshots/ratp-pwa.png)

## Développement
Le front Polymer est construit uniquement à base de composants téléchargés avec
Bower - il n'y a aucun script de build, pas de Vulcanize, etc.

Le back est un tout petit serveur NodeJS.

Pour commencer à développer, il vous faut juste node avec npm, et bower. Se de
placer dans tools, installer le projet puis tle lancer. Les composants Bower
seront automatiquement installés.

Pour le déploiement, attention, pour profiter de l'aspect offline, il faut
absolument servir l'app en HTTPS. Have fun !

```sh
$ cd ratp-pwa.git/tools
$ npm install
# ...
$ npm start
# Install Bower
# ...
# Le serveur est ensuite dispo sur le port 3000.
```

## Changelog
- Version 4 - Ajout du menu et publication sur Github
  - Menu latéral
  - Ajout du README
  - Mise à disposition d'un screenshot
- Version 3 - Animations plus propres
- Version 2 - Tests d'animation
- Version 1 - Fonctionnalités de base :
  - Affichage des horaires (métro + RER A + RER B uniquement)
  - Ajout/suppression de favoris
