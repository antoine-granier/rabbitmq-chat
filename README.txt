Groupe : DERENSY Dany, GRANIER Antoine

Nous avons décidé de réaliser notre application en utilisant trois conteneurs Docker :
- Rabbitmq
- Front (javascript)
- Back (Javascript)

Nous avons mis en place une gestion des sessions utilisateurs via des ID uniques stocker dans le local storage du client. Ainsi, s'il se reconnecte au back il pourra être identifier comme la même personne.
La communication entre le front et le back s'effectue via des sockets permettant un échange en temps réel.
Côté Rabbitmq, il y a deux queues:
- QUEUE_1 = "PUSH"
- QUEUE_2 = "PULL"


        socket
front ---------> back
                  |
                  |
                server.js -----------> QUEUE_1 (Rabbitmq)
                                          |
                                          | consume
                                          |
                                    consumer.js -----------> QUEUE_2 (Rabbitmq)
                                                               |
                                                               | consume
                                                               |
                                                            server.js -----------> front
                                                                         socket