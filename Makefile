
generate:
	bundle exec rake generate

watch:
	bundle exec rake preview

deploy: generate
	bundle exec rake deploy
